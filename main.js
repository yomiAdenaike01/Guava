const cp = require("child_process");
const remote = require("electron").remote;
const {shell,dialog} = require("electron").remote;
//Checks for java installation
cp.exec("javac -version",(err,stdout,stderr)=>{
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
  var notifyJavaNotInstalled = new Notification("Java compiler not installed","We have found that java is not installed on this machine, would you like to download it ?");
  CreateNotificationWithButton(notifyJavaNotInstalled,"Go To Download Java",DownloadJava)
}
/**
 * Can't start the download because they have to verify the liscence agreement
 * 
 */ 
 const DownloadJava =()=> {
   new Notification("To Note!","Remeber the installation path of Java, you will need it later.")
   shell.openExternal("https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html");
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
 * Creates a button element and appends it to the notification body 
 * @param {} text 
 */
const CreateNotificationWithButton = (notification,text,methodToRun) =>{
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

// /**
//  * Find out whether the users machine is 64 bit or 32 bit
//  * Match the users numbers
//  */
// const getUserMachineArchitecture = () =>{
//   //Check OS 
//   if(process.platform === "win32"){
//   cp.exec("wmic os get osarchitecture",(err,stdout,stderr)=>{
//     if(err){

//     }else if(stderr){

//     }else{
//       var match = /64/.test(stdout);
//       if(match === true){
//         return "windows-64-bit";
//       }
//     }
//   });
// }else if(process.platform === "linux"){
//   cp.exec("wmic os get osarchitecture",(err,stdout,stderr)=>{
//     if(err){
//       new Notification("Error!","Encountered error when checking the systems architecture.")
//     }else if(stderr){

//     }else{
//       if(stdout.match("")){

//       }
//     }
//   });
// }
// }