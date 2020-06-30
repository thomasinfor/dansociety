const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const webcam = new Webcam(webcamElement, 'user', canvasElement);
function snap_start(){
  webcam.start().then(result=>{
    console.log("webcam started");
  }).catch(err => {
    console.log(err);
  });
  document.getElementById('snap-start').style.display='none';
}
function snap_snap(){
  var picture = webcam.snap();
  document.getElementById('snap-start').style.display='none';
  document.getElementById('snap-img').style.display='block';
  document.getElementById('snap-img').src = picture;
}