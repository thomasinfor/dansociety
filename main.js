var algo=require('./ml.js');
const http=require('http');
const express=require('express');
const bodyParser=require('body-parser');
// const mongo=require('mongodb').MongoClient;
const formidable=require('formidable');
const fs=require('fs');
const util=require('util');
const mv=util.promisify(require('mv'));
const path=require('path');
const ffmpeg=require('ffmpeg');
// const { exec }=require("child_process");
const exec=require('child-process-promise').exec;
// const posenet=require('@tensorflow-models/posenet');

// const net=posenet.load({
//   architecture: 'MobileNetV1',
//   outputStride: 16,
//   inputResolution: { width: 640, height: 640 },
//   multiplier: 0.75
// });

const apikey='e0cae3a6-2cc8-4b2f-a3a2-2882205deac3';
var token=null;
const dburl="mongodb://localhost:27017/";
const port=2003;
const app=new express();

// mongo.connect(dburl,function(err,db){
//   if(err) throw err;
//   var dbo=db.db('dansociety');
//   dbo.createCollection("subscribe-email",function(err,res){
//     if(err) throw err;
//     console.log("Collection 'subscribe-email' created !");
//     db.close();
//   });
// });
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req,res){
    res.sendFile('./index.html',{"root":__dirname});
}).listen(port,()=>{console.log('Server running at localhost:'+port);});

app.post('/subscribe',(req,res)=>{
  console.log(req.body);
  // mongo.connect(dburl,function(err,db){
  //   if(err) throw err;
  //   var dbo=db.db('dansociety');
  //   dbo.collection("subscribe-email").insertOne({
  //     email:req.body.email,time:new Date()
  //   },function(err,res){
  //     if(err) throw err;
  //     db.close();
  //   });
  // });
  res.end();
});
function content(x){x=String(x);return x.slice(0,x.length-3);}
function status(x){x=String(x);return x.slice(x.length-3);}
function moveVideo(oldpath,newpath){
  console.log(newpath);
  var video = new ffmpeg(oldpath);
  video.then(video=>{
    return video
    .setVideoFrameRate(30)
    .setVideoFormat('mp4')
    .save(newpath);
  });
  return video;
}
function moveImg(oldpath,newpath){
  console.log(newpath);
  return mv(oldpath,newpath,{mkdirp: true});
}
async function updateToken(){
  var cmd=`curl https://api.wrnch.ai/v1/login `+
          `-H "Content-Type: application/json" `+
          `-d "{\\"api_key\\": \\"${apikey}\\"}" `+
          `-X POST `+
          `-w "%{http_code}"`;
  await exec(cmd).then(res=>{
    if(status(res.stdout)==200){
      console.log('token updated !');
      token=JSON.parse(content(res.stdout)).access_token;
      console.log(token);
    }else updateToken();
  }).catch(err=>{
    console.error('request token\nERROR: ',err);
    token=null;
  });
}
updateToken();
function submitWrnch(path,main='centre',width=456,height=256){
  var cmd=`curl https://api.wrnch.ai/v1/jobs `+
          `-H "Authorization: Bearer ${token}" `+
          `-F "work_type=json" `+
          `-F "media=@${path}" `+
          `-X POST `+
          `-w "%{http_code}"`;
  return exec(cmd).then(res=>{
    var st=status(res.stdout);
    if(st==200||st==202){
      var id=JSON.parse(content(res.stdout)).job_id;
      console.log(`wrnch job (id=${id}) submitted !`);
      return id;
    }else return null;
  }).then(id=>{
    if(!id) return id;
    return new Promise((resolve,reject)=>{
      var timer=setInterval(()=>{
        var cmd=`curl https://api.wrnch.ai/v1/status/${id} `+
                `-H "Authorization: Bearer ${token}" `+
                `-w "%{http_code}"`;
        exec(cmd).then(res=>{
          if(content(res.stdout)==`"Processed"\n`){
            console.log(`job ${id} Processed !`);
            resolve(id);
            clearInterval(timer);
          }
        }).catch(err=>{
          console.error(`get job ${id} status\nERROR: `,err);
        });
      },5000);
    });
  }).catch(err=>{
    console.error('submitWrnch\nERROR: ',err);
  });
}
function getResultWrnch(id){
  if(!id) return id;
  var cmd=`curl https://api.wrnch.ai/v1/jobs/${id} `+
          `-H "Authorization: Bearer ${token}" `+
          `-w "%{http_code}"`;
  return exec(cmd).then(res=>{
    var st=status(res.stdout);
    if(st==200){
      console.log(`got job ${id} result !`);
      return JSON.parse(content(res.stdout));
    }else return null;
  }).catch(err=>{
    console.error(`get job ${id} result\nERROR: `,err);
  });
}
function pose(p){
  var jsonp=`./pose/${path.parse(p).name}.json`;
  if(!fs.existsSync(jsonp)){
    return submitWrnch(p).then(getResultWrnch).then(res=>{
      fs.writeFile(jsonp,JSON.stringify(res,null,2),err=>{
        if(err) throw err;
        else console.log(`wrote ${jsonp}`);
      });
      return res;
    });
  }else{
    return new Promise((resolve,reject)=>{
      fs.readFile(jsonp,(err,data)=>{
        if(err) throw err;
        console.log(`read ${jsonp}`);
        resolve(JSON.parse(data));
      });
    });
  }
}
function evaluate(p1,v1,p2,v2){
  console.log(p1,v1,p2,v2);
  return Promise.all([pose(p1),pose(v1),pose(p2),pose(v2)]).then(values=>{
    if(values[0]==null) return null;
    return algo.evaluate_loss(values[0],values[1],values[2],values[3]);
  }).catch(err=>{
    console.log(`evaluate\n${p1}\n${v1}\n${p2}\n${v2}\nERROR: ${err}`);
  });
}

app.post('/demo/evaluate',(req,res)=>{
  console.log('post evaluate');
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if(err){next(err);return;}
    // console.log(fields);
    // console.log(files);
    try{
      var pimg=path.join(path.join(__dirname,'./data/'),files.userImg.name);
      var pvideo=path.join(path.join(__dirname,'./data/'),files.userVideo.name+'.mp4');
      var img=moveImg(files.userImg.path,pimg);
      var video=moveVideo(files.userVideo.path,pvideo);
      Promise.all([img,video]).then(values=>{
        return evaluate(
          './public/demo/demo-pict.png',
          './public/demo/demo-video.mp4',
          pimg,pvideo
        );
      }).then(pts=>{
        console.log(pts);
        res.end(String(pts));
        console.log('post evaluate end');
      }).catch(e=>{
        console.log(e);
      });
    }catch(e){console.log(e);}
  });
});