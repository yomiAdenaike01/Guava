const cp = require("child_process");
const remote = require("electron").remote;
//Checks for java installation
cp.exec("java -v",(err,stdout,stderr)=>{
    if(err){
      InitJavaDownloadAndInstallation(err);
    }else if(stderr){
      console.log("Output error: "+stderr);
    }else{
      console.log("Complete Output: "+stdout);
    }
  });
/**
 * 
 * @param {*} err
 * Check the error using regular expression 
 * Checks whether the system is 32-bit or 64-bit  
 */
const InitJavaDownloadAndInstallation = (err) => {
  //Display the notification first 
  var notifyJavaNotInstalled = new Notification("JAVA not installed","We have found that java is not installed on this machine, would you like to download it ?");
  CreateButton(notifyJavaNotInstalled,"Download Java ?",DownloadJava)
}

/**
 * Init the electron downloader to install java 
 * Create a new notification to display that the latest java JDK is being donwloaded
 * Create a new notification once it has been completed.
 *  Request if they want to install
 * */ 
export function DownloadJava() {
  //Display notification of download 
  new Notification("Download","Currently downloading the latest java version...");
  remote.getCurrentWebContents().downloadURL("https://www.google.com/search?q=image&tbm=isch&source=iu&ictx=1&fir=QJ7Sqsi_rIj3AM%253A%252CGqyXoQNMf1XwFM%252C_&vet=1&usg=AI4_-kTbcVAM2zKBISEuO0GJQnw5nvB5dg&sa=X&ved=2ahUKEwjp9pa2qtvjAhWLZMAKHXCfC3YQ9QEwAHoECAMQMg#imgrc=QJ7Sqsi_rIj3AM:");

  //Check the download progress
  remote.getCurrentWebContents().on("will-download",()=>{
    
  })
}
/**
 * Requres the path that java was downloaded to 
 * Once the path has been found run child exec on the file to install it 
 * Create notification at the end of the installation once it has been completed
 * Urge them to restart the editor once the installation is done.
 * @param {*} pathToInstallJava 
 */
export function InstallJava(pathToInstallJava){

}

/**
 * Creates a button element and appends it to the notification body 
 * @param {} text 
 */
const CreateButton = (notification,text,methodToRun) =>{
  notification;
  if(notification){

    var notificationBody = document.querySelector(".notificationBody");
    var addButton = document.createElement("button");
    //Change notification body style
    notificationBody.style.minHeight = "100px";
    //Adding button styles
    addButton.textContent = text;
    addButton.style.background = "#777";
    addButton.style.color = "#fff";
    addButton.style.borderRadius = "2px";
    addButton.style.padding = "3px";
 
    addButton.addEventListener("click",methodToRun);
    notificationBody.appendChild(addButton);
  }
}
