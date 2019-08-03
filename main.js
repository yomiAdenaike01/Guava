const cp = require("child_process");
const remote = require("electron").remote;
const {shell,dialog,app} = require("electron").remote;
const fs = require("fs");
const path = require("path");
const ProgressBar = require(path.join(__dirname,"./ProgressBar"));
const sudo = require("sudo-prompt");
let mainTimeOut = 1500;
//Permissions dialog
var permissionsDialogOptions = {
  name: "Graviton",
  icns:"icon2.ico"
}
/**
 * Runs the method after 1 second to not overwhelm the user
 */
setTimeout(function(){
  RequestPermissions();
  init();
},mainTimeOut);


  //Create menu item for java 
const myPluginDropMenu = new dropMenu({
  id:"java_set_up"
});
myPluginDropMenu.setList({
  "button": "Java",
  "list":{
    "Check for java compiler installation":{
      click:function(){
       init();
      }
    }
  }
})
/**
 * Check local storage for the download path 
 * If there is no local storage then run the run java check and then begin the process
 */
function init(){
  if(process.platform === "win32" && localStorage.getItem("save_path") === null){
    RunJavaCheck();
  }else if(localStorage.getItem("save_path") !== null){
    InstallJavaController("installation_found",localStorage.getItem("save_path"));
  }
}

/**
 * Check for java
 */
function RunJavaCheck(){
  cp.exec("javac -version",(err,stdout,stderr)=>{
    if(err){
      InitJavaDownloadAndInstallation(err);
    }else if(stderr){
      console.log("Output error: "+stderr);
    }else{
      console.log("Complete Output: "+stdout);
    }
  });
}


  /**
 * 
 * @param {*} err
 * Requests to download java 
 */
function InitJavaDownloadAndInstallation(err) {
  console.log(localStorage.getItem("save_path"));
   new Notification("Java compiler not found","Do you want to download Java ?",{
    "Download Java":DownloadJava
});
}

/**
 * Downloads the JDK from alternative source (Oracle rejects the downloads)
 * Displays notifications on download and on-complete.
 * Saves the download to the users downloads folder
 * 
 * JAVA LINK =  https://javadl.oracle.com/webapps/download/AutoDL?BundleId=238713_478a62b7d4e34b78b671c754eaaf38ab
 * 
 * TEST LINK = https://www.google.com/search?q=image&tbm=isch&source=iu&ictx=1&fir=QJ7Sqsi_rIj3AM%253A%252CGqyXoQNMf1XwFM%252C_&vet=1&usg=AI4_-kTbcVAM2zKBISEuO0GJQnw5nvB5dg&sa=X&ved=2ahUKEwjv__3Xx93jAhVRa8AKHX7GBQ4Q9QEwAHoECAcQMg#imgrc=QJ7Sqsi_rIj3AM:
 */ 
function DownloadJava() {

    let downloadProgress;
    ProgressBar.CreateProgressBar();

    new Notification("JDK Progress","Check the console to view the download progress, We will notify you when the download is complete.");
    let userDownloadPath = app.getPath("downloads").toString();
    let downloadURL = "https://javadl.oracle.com/webapps/download/AutoDL?BundleId=238713_478a62b7d4e34b78b671c754eaaf38ab" ;
    remote.getCurrentWebContents().downloadURL(downloadURL);
    remote.getCurrentWebContents().session.on("will-download",(event,item,webContents)=>{  
      item.setSavePath(userDownloadPath);
      downloadFilePath = item.getSavePath()+'\\'+item.getFilename();
      item.on("updated",(event,state)=>{

        if(state === "interrupted"){
          new Notification("Download Interrupted", "The Java JDK download has been interrupted, woudld you like to restart the download ?",{"Yes":function()
        {
          ProgressBar.RemoveProgressBar();
        }})
        }

        if(state === "progressing"){
          downloadProgress = item.getReceivedBytes() * 100/ item.getTotalBytes();
          ProgressBar.UpdateProgressBar(downloadProgress);
        }
      });

      item.once("done",(event,state)=>{
        if(state === "completed"){
          //Set the local storage
          localStorage.setItem("save_path",downloadFilePath);

          new Notification("Download Complete","Java JDK download complete! Would you like us to run the installation for you ?",{"Install":function(){
            //Get the local storage
              InstallJavaController("",localStorage.getItem("save_path"));
            }
          });
        }
      });
    });
}


/**
 * 
 * @param {*} state 
 * @param {*} savePath 
 */
function InstallJavaController(state,savePath) {
  if(state !== "installation_found"){
    ProgressBar.RemoveProgressBar();
    //Write installation path to JSON file
  }else{
    new Notification("✔️ JDK Download File Found !","We found a prior downloaded JDK file, would you like to install it or re-download a new version ?",
    {"Install":function(){

      RunInstallCommand();

    },"No, I have already installed this":function(){
    
      new Notification("Set Environment Variable","Have you set the environment variable for the compiler ?",{
        "No, can you set it for me ?":function(){
          OpenInstallationDirectory();
        },"Yes, I have.":function(){

          RunJavaCheck()

        }
      });
    }
  });
  }
}


/**
 * 
 * Runs the installation command 
 */
function RunInstallCommand(){
  var savePath = localStorage.getItem("save_path");
  sudo.exec("runas /user:Administator "+savePath,(err,data)=>{
      if(err){
        InstallationError(err)    
      }else{
        new Notification("Installing Java","Running the java installation, once complete follow the following instructions")
      }
    });
}


/**
 * Display notification for opening the containing folder or open the dev tools to inspect the error.
 * @param {*} err 
 */
function InstallationError(err){
  console.log(err);
  new Notification("Error!","Error when attempting to install Java, do you want us to open the containing folder ?",{"Open installation folder":function(){
    shell.showItemInFolder(localStorage.getItem("save_path"));
  }, "View error in console":function(){
    remote.getCurrentWebContents().openDevTools();
  }
});
}

/**
 * Get the installation path of the JDK 
 * And then run the command in the terminal
 */
function OpenInstallationDirectory(){ 
  //Let them know where to look for the installation
  if(process.platform === "win32"){
    new Notification(" 👋 To Note","When selecting a path, you need to choose where Java was installed, because you are running on windows this should be in C://Program Files/Java/JDK(version number)",{"Okay, got it.":function(){
    return
    }})
  }
  const dialogProperties = {
    properties:["openDirectory"]
  };
  dialog.showOpenDialog(remote.getCurrentWindow(),dialogProperties,(dir)=>{
    if(dir != undefined || dir != null){
      alert(dir);
      //location the installation and save it to localstorage
      localStorage.setItem("jdk_installation_path",dir);
      SetJavaEnvironmentVariableCommand();
    }else{
      new Notification("⚠️ Error!","You didn't select the java installation path, please select a path",{
        "Select Installation Folder":function(){
          OpenInstallationDirectory()
        },"I'll do it later":function(){
        }
     });
    }
  });
}
/**
 * Runs the command 
 * On error will ask to run it again 
 * If the error doesnt work then direct them to the website
 */
function SetJavaEnvironmentVariableCommand(){
  var installationPath = localStorage.getItem("jdk_installation_path");
  //set PATH="%PATH%;C:\Program Files\Java\jdk1.6.0_18\bin"
  var setSystemVar;
  var setUserVar;
  if(process.platform === "win32"){
    setSystemVar = `setx -m JAVA_HOME ${installationPath}`;
    setUserVar = ``;
  }else if(process.platform === "darwin"){
    setSystemVar = `setx -m JAVA_HOME ${installationPath}`;
    setUserVar = ``;
  }else{
    setSystemVar = `setx -m JAVA_HOME ${installationPath}`;
    setUserVar = ``;
  }
  var options = {
    name: 'Graviton',
    icns: './icon2.ico', 
  };
  sudo.exec(setSystemVar || setUserVar ,options,function(err,stdout,stderr){
    if(err){
      //Opens the notification to the guide
      new Notification("⚠️ Could not set variable", "Error found when setting the environmental variable, please find the guide to setting the variable below.",{"Read Guide":function(){
        //Open the installation guide
        shell.openExternal("https://www.java.com/en/download/help/path.xml")
      },"No":function(){
        //Close the notification
      }
    });
    }else{
      console.log("STDERR",stderr);
      console.log("STDOUT",stdout);
      new Notification("👍 Installation Complete ","The Java JDK installation is complete, you will need to restart the editor to see whether it has installed correctly.",{"Restart Now":function(){
        // Restart the application
      },"Restart Later":function(){
        //Close the notification
      }});  
    }
  });  
  
}

