
function CreateProgressBar(){
  //Create the wrapper
  let progressBar = document.createElement("div");
  progressBar.classList.add("download_progress_bar");
  progressBar.style.position = "fixed";
  progressBar.style.bottom = "0";
  progressBar.style.background = "#222";
  progressBar.style.padding = "5px";
  progressBar.style.margin = "6px";
  progressBar.textContent= "Downloading....";
  progressBar.style.color = "white";
  progressBar.style.fontSize = "12";
  progressBar.style.borderRadius = "5px";
  
  //Create the innerbar to fill the progress
  let innerBar = document.createElement("div");
  innerBar.classList.add("inner-bar")
  innerBar.style.position = "absolute";
  innerBar.style.left = "0";
  innerBar.style.right = "100%";
  innerBar.style.background = "linear-gradient(120deg, #fc1163 0%, #ee8027 100%)";
  innerBar.style.top = "0";
  innerBar.style.bottom = "0";
  innerBar.style.transition = ".56s ease all";
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
function UpdateProgressBar(progress) {
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



 
module.exports = {
  CreateProgressBar,
  UpdateProgressBar,
  RemoveProgressBar
}