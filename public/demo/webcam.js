const webcamElement = document.getElementById('webcam-js');
const canvasElement = document.getElementById('canvas');
var resultimg=false;
var constraintObj = { 
  audio: false, 
  video: { 
    facingMode: "user", 
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 } 
  } 
};
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
    let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraintObj, resolve, reject);
    });
  }
}else{
  function snap_start(){
    document.getElementById('webcam-js').style.display='block';
    document.getElementById('snap-retry').style.display='none';
    document.getElementById('snap-done').style.display='none';
    document.getElementById('snap-img').style.display='none';
    document.getElementById('snap-start').removeEventListener('click',snap_start);
    navigator.mediaDevices.getUserMedia(constraintObj)
    .then(function(mediaStreamObj) {
      if ("srcObject" in webcamElement) {
        console.log('this');
        webcamElement.srcObject = mediaStreamObj;
      } else {
        console.log('that');
        webcamElement.src = window.URL.createObjectURL(mediaStreamObj);
      }
      
      webcamElement.onloadedmetadata = function(ev) {
        webcamElement.play();
      };
    }).then(result=>{
      console.log("webcam started");
    }).catch(err => {
      console.log(err);
    });
    var cnt=6,id;
    document.getElementById('snap-start').innerHTML=`SNAPSHOT IN ${cnt-1}s`;
    cnt--;
    id=setInterval(()=>{
      if(cnt==0){
        document.getElementById('snap-start').addEventListener('click',snap_start);
        snap_snap();
        document.getElementById('snap-start').style.display='none';
        clearInterval(id);
      }else{
        document.getElementById('snap-start').innerHTML=`SNAPSHOT IN ${cnt-1}s`;
        cnt--;
      }
    },1000);
  }
  function snap_snap(){
    var context = canvasElement.getContext('2d');
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    context.drawImage(webcamElement, 0, 0, webcamElement.videoWidth, webcamElement.videoHeight);
    resultimg=canvas.toBlob(blob=>{
      formdata.set('userImg',blob,`${new Date().valueOf()}.png`);
    });
    document.getElementById('snap-img').src=canvas.toDataURL('image/png');
    document.getElementById('snap-img').style.display='block';
    document.getElementById('webcam-js').style.display='none';
    document.getElementById('snap-start').style.display='none';
    document.getElementById('snap-retry').style.display='block';
    document.getElementById('snap-done').style.display='block';
  }
  function snap_retry(){
    document.getElementById('snap-start').style.display='block';
    snap_start();
  }
  function submit_img(ele){}
  function snap_done(){
    submit_img(document.getElementById('snap-img'));
    document.getElementById('video').scrollIntoView();
  }
  document.getElementById('snap-start').addEventListener('click',snap_start);
  document.getElementById('snap-retry').onclick=snap_retry;
  document.getElementById('snap-done').onclick=snap_done;
}