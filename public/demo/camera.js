var x;
function init_camera(){
  let constraintObj = { 
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
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      devices.forEach(device=>{
        console.log(device.kind.toUpperCase(), device.label);
        //, device.deviceId
      })
    })
    .catch(err=>{
      console.log(err.name, err.message);
    })
  }

  navigator.mediaDevices.getUserMedia(constraintObj)
  .then(function(mediaStreamObj) {
    let video = document.querySelector('#camera');
    if ("srcObject" in video) {
      video.srcObject = mediaStreamObj;
    } else {
      video.src = window.URL.createObjectURL(mediaStreamObj);
    }
    
    video.onloadedmetadata = function(ev) {
      video.play();
    };
    
    let start = document.getElementById('btnStart');
    let stop = document.getElementById('btnStop');
    let vidSave = document.getElementById('capture');
    let mediaRecorder = new MediaRecorder(mediaStreamObj);
    let chunks = [];
    var model=document.getElementById('model');
    var startfunction=(ev)=>{
      model.currentTime=0;
      model.controls=false;
      document.getElementById('camera').style.display='block';
      document.getElementById('model').style.display='block';
      start.removeEventListener('click',startfunction);
      var cnt=6,id;
      document.getElementById('btnStart').innerHTML=`START IN ${cnt-1}s`;
      model.onended=stopfunction;
      cnt--;
      id=setInterval(()=>{
        if(cnt==0){
          start.addEventListener('click',startfunction);
          mediaRecorder.start();
          document.getElementById('model').play().catch((e)=>{console.log(e);});
          document.getElementById('btnStart').style.display='none';
          document.getElementById('btnStart').innerHTML='START';
          document.getElementById('btnStop').style.display='block';
          console.log(mediaRecorder.state);
          clearInterval(id);
        }else{
          document.getElementById('btnStart').innerHTML=`START IN ${cnt-1}s`;
          cnt--;
        }
      },1000)
    }
    start.addEventListener('click',startfunction);
    var stopfunction=(ev)=>{
      mediaRecorder.stop();
      model.pause();
      model.onended=()=>{};
      model.currentTime=0;
      model.controls=true;
      console.log(mediaRecorder.state);
    }
    stop.addEventListener('click', stopfunction);
    document.getElementById('btnAgain').addEventListener('click', (ev)=>{
      model.pause();
      model.currentTime=0;
      start.style.display='block';
      model.controls=false;
      document.getElementById('camera').style.display='block';
      document.getElementById('capture-block').style.display='none';
      document.getElementById('btnAgain').style.display='none';
    });
    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
    }
    mediaRecorder.onstop=(ev)=>{
      let blob = new Blob(chunks, { 'type' : 'video/mp4;' });
      chunks = [];
      let videoURL = window.URL.createObjectURL(blob);
      vidSave.src = videoURL;
      document.getElementById('capture-block').style.display='block';
      video.style.display='none';
      document.getElementById('btnStop').style.display='none';
      document.getElementById('btnAgain').style.display='block';
    }
    model.onplay=()=>{vidSave.play().catch((e)=>{console.log(e);});};
    model.onpause=()=>{vidSave.pause();};
    model.ontimeupdate=()=>{vidSave.currentTime=model.currentTime;}
  })
  .catch(function(err) { 
    console.log(err.name, err.message); 
  });
}
init_camera();