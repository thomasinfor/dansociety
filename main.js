const express=require('express');
const bodyParser=require('body-parser');
const mongo=require('mongodb').MongoClient;
const formidable=require('formidable');
const fs=require('fs');
const path=require('path');
const ffmpeg=require('ffmpeg');
// const { exec }=require("child_process");
// const posenet=require('@tensorflow-models/posenet');

// const net=posenet.load({
//   architecture: 'MobileNetV1',
//   outputStride: 16,
//   inputResolution: { width: 640, height: 640 },
//   multiplier: 0.75
// });

const dburl="mongodb://localhost:27017/";
const port=2003;
const app=new express();

mongo.connect(dburl,function(err,db){
  if(err) throw err;
  var dbo=db.db('dansociety');
  dbo.createCollection("subscribe-email",function(err,res){
    if(err) throw err;
    console.log("Collection 'subscribe-email' created !");
    db.close();
  });
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req,res){
    res.sendFile('./index.html',{"root":__dirname});
}).listen(port,()=>{console.log('Server running at localhost:'+port);});

app.post('/subscribe',(req,res)=>{
  console.log(req.body);
  mongo.connect(dburl,function(err,db){
    if(err) throw err;
    var dbo=db.db('dansociety');
    dbo.collection("subscribe-email").insertOne({
      email:req.body.email,time:new Date()
    },function(err,res){
      if(err) throw err;
      db.close();
    });
  });
  res.end();
});

function moveVideo(oldpath,newpath){
  console.log(newpath);
  var process = new ffmpeg(oldpath);
  process.then(video=>{
    return video
    .setVideoFrameRate(30)
    .setVideoFormat('mp4')
    .save(newpath,);
  });
  return process;
}
function moveImg(oldpath,newpath){
  console.log(newpath);
  return fs.promises.rename(oldpath,newpath);
}
function evaluate(img1,video1,img2,video2){
  return new Promise((resolve,reject)=>{
    resolve('100pts');
  });
}

app.post('/demo/evaluate',(req,res)=>{
  console.log('evaluate');
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if(err){next(err);return;}
    // console.log(fields);
    // console.log(files);
    try{
      var img=moveImg(
        files.userImg.path,
        path.join(path.join(__dirname,'./data/'),files.userImg.name)
      );
      var video=moveVideo(
        files.userVideo.path,
        path.join(path.join(__dirname,'./data/'),files.userVideo.name+'.mp4')
      );
      Promise.all([img,video]).then(values=>{
        return evaluate(1,2,3,4);
      }).then(pts=>{
        res.end(pts);
      }).catch(e=>{
        console.log(e);
      });
    }catch(e){console.log(e);}
  });
});