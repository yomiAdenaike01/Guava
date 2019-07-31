const cp = require("child_process");
const remote = require("electron").remote;
const {shell,dialog,app} = require("electron").remote;
const fs = require("fs");
const path = require("path");
const DB = require(path.join(__dirname,"./db.json"));
//Globally define download path
var downloadFilePath;
//Checks for java installation
if(process.platform === "win32" && DB.java_installation_path === null){
cp.exec("javac -version",(err,stdout,stderr)=>{
    if(err){
      InitJavaDownloadAndInstallation(err);
    }else if(stderr){
      console.log("Output error: "+stderr);
    }else{
      console.log("Complete Output: "+stdout);
    }
  });
}else if(DB.java_installation_path !== null){
  InstallJava("installation_found",DB.java_installation_path);
}
  /**
 * 
 * @param {*} err
 * Requests to download java 
 */
const InitJavaDownloadAndInstallation = (err) => {
  console.log(DB.java_installation_path);
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
    CreateProgressBar();
   
    new Notification("JDK Progress","Check the console to view the download progress, We will notify you when the download is complete.");
    let userDownloadPath = app.getPath("downloads").toString();

    let downloadURL = "https://javadl.oracle.com/webapps/download/AutoDL?BundleId=238713_478a62b7d4e34b78b671c754eaaf38ab" ;

    
    remote.getCurrentWebContents().downloadURL(downloadURL);
    remote.getCurrentWebContents().session.on("will-download",(event,item,webContents)=>{  

      item.setSavePath(userDownloadPath);
      downloadFilePath = item.getSavePath()+'\\'+item.getFilename();

      DB.java_installation_path = downloadFilePath;

      item.on("updated",(event,state)=>{
        if(state === "interrupted"){
          new Notification("Download Interrupted", "The Java JDK download has been interrupted, woudld you like to restart the download ?",{"Yes":function()
        {
          RemoveProgressBar();
        }})
        }
        if(state === "progressing"){
          downloadProgress = item.getReceivedBytes() * 100/ item.getTotalBytes();
          UpdateProgressBar(downloadProgress);
        }
      });

      item.once("done",(event,state)=>{
        if(state === "completed"){
          new Notification("Download Complete","Java JDK download complete! Would you like us to run the installation for you ?",{"Install":function(){
              InstallJava("",downloadFilePath);
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
function InstallJava(state,savePath) {
  if(state !== "installation_found"){
  RemoveProgressBar();
    //Write installation path to JSON file
    OverWriteDB(savePath);
    DB.java_installation_path = savePath;
    fs.writeFile(path.resolve(__dirname,"./db.json"),JSON.stringify(DB),(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Write complete!");
        console.log(JSON.stringify(DB));
        RunInstallCommand(savePath);
      }
    });
}else{
  new Notification("JDK Download File Found !","We found a prior downloaded JDK file, would you like to install it or re-download a new version ?",
  {"Install":function(){
    RunInstallCommand(DB.java_installation_path);
  }
});
}
}


/**
 * 
 * @param {*} savePath 
 * Hoisting
 * Runs the installation command 
 */
function RunInstallCommand(savePath){
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
    shell.showItemInFolder(DB.java_installation_path);
  }, "View error in console":function(){
    remote.getCurrentWebContents().openDevTools();
  }


});
}

/**
 * Get the request the java installation path 
 * Set the environmental variable from there
 */
const SetJavaEnvironmentVariable = () =>{
  dialog.showOpenDialog(remote.getCurrentWindow(),null,(file)=>{
    if(file !== undefined){
      
    }
  });
}

const CreateProgressBar = () =>{
  //Create the wrapper
  let progressBar = document.createElement("div");
  progressBar.classList.add("download_progress_bar");

  progressBar.style.position = "fixed";
  progressBar.style.bottom = "0";
  progressBar.style.background = "#222";
  progressBar.style.padding = "5px";
  progressBar.style.margin = "6px";
  progressBar.style.width = "100%";

  //Create the innerbar to fill the progress
  let innerBar = document.createElement("div");
  innerBar.classList.add("inner-bar")
  innerBar.style.position = "absolute";
  innerBar.style.left = "0";
  innerBar.style.right = "100%";
  innerBar.style.background = "linear-gradient(120deg, #f6d365 0%, #fda085 100%)";
  innerBar.style.top = "0";
  innerBar.style.bottom = "0";
  innerBar.style.borderRadius = progressBar.style.borderRadius;
  //Append innerbar
  progressBar.appendChild(innerBar);
  
  //Append to document boddy if there is no progress bar 
  document.body.append(progressBar);
}


/**
 * Updates the progress bar
 * @param {*} progress 
 */
const UpdateProgressBar = (progress) => {
  if(document.querySelector(".inner-bar")){
    let depreciatingProgress = 100 - progress;
    let innerProgressBar = document.querySelector(".inner-bar");
 
    innerProgressBar.style.right = depreciatingProgress.toString() + "%"
  }
}

/**
 * Remove the progress bar.
 * Hoisting
 */
 function RemoveProgressBar(){
   if(document.querySelector(".download_progress_bar")){
    let ProgressBarWrapper = document.querySelector(".download_progress_bar");
    document.body.removeChild(ProgressBarWrapper);
   }
 }

