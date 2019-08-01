const cp = require("child_process");
const remote = require("electron").remote;
const {shell,dialog,app} = require("electron").remote;
const fs = require("fs");
const path = require("path");
const progressBar = require(path.join(__dirname,"./progressBar"));
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

if(process.platform === "win32" && localStorage.getItem("save_path") === null){
  RunJavaCheck();
}else if(localStorage.getItem("save_path") !== null){
  InstallJavaController("installation_found",localStorage.getItem("save_path"));
}
  /**
 * 
 * @param {*} err
 * Requests to download java 
 */
const InitJavaDownloadAndInstallation = (err) => {
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
 const DownloadJava =()=> {

    let downloadProgress;
    progressBar.CreateProgressBar();

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
          progressBar.RemoveProgressBar();

        }})
        }

        if(state === "progressing"){
          downloadProgress = item.getReceivedBytes() * 100/ item.getTotalBytes();
          progressBar.UpdateProgressBar(downloadProgress);
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
 * Controls the installlation process
 * Hoisting 
 */
function InstallJavaController(state,savePath) {
  if(state !== "installation_found"){
  progressBar.RemoveProgressBar();
    //Write installation path to JSON file
  }else{
    new Notification("JDK Download File Found !","We found a prior downloaded JDK file, would you like to install it or re-download a new version ?",
    
    {"Install":function(){

      RunInstallCommand();

    },"No, I have already installed this":function(){
    
      new Notification("Set Environment Variable","Have you set the environment variable for the compiler ?",{
        "No, can you set it for me ?":function(){

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
 * Hoisting
 * Runs the installation command 
 */
function RunInstallCommand(){
  var savePath = localStorage.getItem("save_path");
cp.execFile(savePath,(err,data)=>{
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
 * Get the request the java installation path 
 * Set the environmental variable from there
 */
function SetJavaEnvironmentVariable(){
  dialog.showOpenDialog(remote.getCurrentWindow(),null,(file)=>{
    if(file !== undefined){
      
    }
  });
}

