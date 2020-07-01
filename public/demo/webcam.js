const webcamElement = document.getElementById('webcam-js');
const canvasElement = document.getElementById('canvas');
const webcam = new Webcam(webcamElement, 'user', canvasElement);
function snap_start(){
  document.getElementById('webcam-js').style.display='block';
  document.getElementById('snap-retry').style.display='none';
  document.getElementById('snap-done').style.display='none';
  document.getElementById('snap-img').style.display='none';
  document.getElementById('snap-start').removeEventListener('click',snap_start);
  webcam.start().then(result=>{
    console.log("webcam started");
  }).catch(err => {
    console.log(err);
  });
  var cnt=6,id;
  document.getElementById('snap-start').innerHTML=`SNAP IN ${cnt-1}s`;
  cnt--;
  id=setInterval(()=>{
    if(cnt==0){
      document.getElementById('snap-start').addEventListener('click',snap_start);
      snap_snap();
      document.getElementById('snap-start').style.display='none';
      clearInterval(id);
    }else{
      document.getElementById('snap-start').innerHTML=`SNAP IN ${cnt-1}s`;
      cnt--;
    }
  },1000);
}
function snap_snap(){
  var picture = webcam.snap();
  webcam.stop();
  document.getElementById('snap-img').src=picture;
  document.getElementById('snap-img').style.display='block';
  // document.getElementById('snap-img').style.width=document.getElementById('webcam-js').width+'px';
  // document.getElementById('snap-img').style.height=document.getElementById('webcam-js').height+'px';
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