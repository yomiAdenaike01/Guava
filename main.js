const cp = require("child_process");
const remote = require("electron").remote;
const {shell,dialog,app} = require("electron").remote;
const fs = require("fs");
const path = require("path");
/**
 * Have java installed 
 * If the environment variable is set
 * If the javac is downloaded
 */
const javaOnMachineState = require("./javaState.json");

//Globally define download path
var downloadFilePath;

//Checks for java installation
if(process.platform === "win32" && javaOnMachineState.is_javac_on_machine === false){
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
const InitJavaDownloadAndInstallation = (err) => {
  console.log(javaOnMachineState.java_installation_path);
   new Notification("Java compiler not found","Do you want to download Java ?",{
    "Download Java":DownloadJava
});
}

/**
 * Downloads the JDK from alternative source (Oracle rejects the downloads)
 * Displays notifications on download and on-complete.
 * Saves the download to the users downloads folder
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

      item.on("updated",(event,state)=>{
        if(state === "progressing"){
          downloadProgress = item.getReceivedBytes() * 100/ item.getTotalBytes();
          UpdateProgressBar(downloadProgress);
        }
      });

      item.once("done",(event,state)=>{
        if(state === "completed"){
          new Notification("Download Complete","Java JDK download complete! Would you like us to run the installation for you ?",{"Install":function(){
              InstallJava(downloadFilePath);
            }
          });
        }
      });
    });
}


/**
 * Get the download save path and run the installation
 */
const InstallJava = (savePath) => {
  RemoveProgressBar();
  if(javaOnMachineState.java_installation_path == null){
    //Write installation path to JSON file
    javaOnMachineState.java_installation_path = savePath;
    fs.writeFileSync(path.resolve(__dirname,savePath),JSON.stringify(javaOnMachineState));
  }

  cp.execFile(savePath,(err,data)=>{
   
    if(err){
      console.log(err);
      new Notification("Error!","Error when installing Java, do you want to try again",{"Yes":function(){
        InstallJava(savePath);
      }});

    }else{
      new Notification("Installing Java","Running the java installation, once complete follow the following instructions")
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
/**
 * Writes to json file
 */
const SetJSONFile = () =>{
  let jsonDBPath;
}

const CreateProgressBar = () =>{
  
  //Create the wrapper
  let progressBar = document.createElement("div");
  progressBar.classList.add("download_progress_bar");
  progressBar.style.position = "fixed";
  progressBar.style.bottom = "0";
  progressBar.style.background = "#444";
  progressBar.style.width = "100%";
  progressBar.style.color = "white";
  progressBar.style.fontSize = "15px";
  progressBar.style.fontWeight = "300";
  progressBar.textContent = "Java JDK download progress...";
  progressBar.style.textAlign = "center";
  progressBar.style.transition = ".26s ease all";

  //Create the innerbar to fill the progress
  let innerBar = document.createElement("div");
  innerBar.classList.add("inner-bar")
  innerBar.style.position = "absolute";
  innerBar.style.left = "0";
  innerBar.style.right = "100%";
  innerBar.style.background = "linear-gradient(120deg, #f6d365 0%, #fda085 100%)";
  innerBar.style.top = "0";
  innerBar.style.bottom = "0";

  //Append innerbar
  progressBar.appendChild(innerBar);
  //Append to document body
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
 */
 const RemoveProgressBar = () =>{
   if(document.querySelector(".download_progress_bar")){
    let ProgressBarWrapper = document.querySelector(".download_progress_bar");
    document.removeChild(ProgressBarWrapper);
   }
 }