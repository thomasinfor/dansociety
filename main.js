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
const execute=require('child-process-promise').exec;

const apikey='e0cae3a6-2cc8-4b2f-a3a2-2882205deac3';
var token=null;
const dburl="mongodb://localhost:27017/";
const port=2003;
const app=new express();

const log=(new console.Console({
  stdout: fs.createWriteStream('./log/stdout.log',{flags:'a'}),
  stderr: fs.createWriteStream('./log/stderr.log',{flags:'a'})
})).log;
// const log=console.log;

// mongo.connect(dburl,function(err,db){
//   if(err) throw err;
//   var dbo=db.db('dansociety');
//   dbo.createCollection("subscribe-email",function(err,res){
//     if(err) throw err;
//     log("Collection 'subscribe-email' created !");
//     db.close();
//   });
// });
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req,res){
    res.sendFile('./index.html',{"root":__dirname});
}).listen(port,()=>{log('Server running at localhost:'+port);});

app.post('/subscribe',(req,res)=>{
  log(req.body);
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
  log(newpath);
  var video = new ffmpeg(oldpath);
  var ret=new Promise((resolve,reject)=>{
    video.then(video=>{
      return video
      .setVideoFrameRate(30)
      .setVideoFormat('mp4')
      .save(newpath,(err,file)=>{resolve(file);});
    });
  });
  return ret;
}
function moveImg(oldpath,newpath){
  log(newpath);
  return mv(oldpath,newpath,{mkdirp: true});
}
async function updateToken(){
  var cmd=`curl https://api.wrnch.ai/v1/login `+
          `-H "Content-Type: application/json" `+
          `-d "{\\"api_key\\": \\"${apikey}\\"}" `+
          `-X POST `+
          `-w "%{http_code}"`;
  await execute(cmd).then(res=>{
    if(status(res.stdout)==200){
      log('token updated !');
      token=JSON.parse(content(res.stdout)).access_token;
      log(token);
    }else updateToken();
  }).catch(err=>{
    log('request token\nERROR: ',err);
    token=null;
  });
}
function submitWrnch(path,main='centre',width=456,height=256){
  if(!token) updateToken();
  var cmd=`curl https://api.wrnch.ai/v1/jobs `+
          `-H "Authorization: Bearer ${token}" `+
          `-F "work_type=json" `+
          `-F "media=@${path}" `+
          `-F "main_person=${main}" `+
          `-X POST `+
          `-w "%{http_code}"`;
  return execute(cmd).then(res=>{
    var st=status(res.stdout);
    if(st==200||st==202){
      var id=JSON.parse(content(res.stdout)).job_id;
      log(`wrnch job (id=${id}) submitted !`);
      return id;
    }else{
      log(cmd);
      log(st,res.stdout);
      return null;
    }
  }).then(id=>{
    if(!id) return id;
    return new Promise((resolve,reject)=>{
      var timer=setInterval(()=>{
        if(!token) updateToken();
        var cmd=`curl https://api.wrnch.ai/v1/status/${id} `+
                `-H "Authorization: Bearer ${token}" `+
                `-w "%{http_code}"`;
        execute(cmd).then(res=>{
          if(content(res.stdout)==`"Processed"\n`){
            log(`job ${id} Processed !`);
            resolve(id);
            clearInterval(timer);
          }
        }).catch(err=>{
          log(`get job ${id} status\nERROR: `,err);
        });
      },5000);
    });
  }).catch(err=>{
    log('submitWrnch\nERROR: ',err);
  });
}
function getResultWrnch(id){
  if(!id) return id;
  if(!token) updateToken();
  var cmd=`curl https://api.wrnch.ai/v1/jobs/${id} `+
          `-H "Authorization: Bearer ${token}" `+
          `-w "%{http_code}"`;
  return execute(cmd,{maxBuffer: 10*1024*1024}).then(res=>{
    var st=status(res.stdout);
    if(st==200){
      log(`got job ${id} result !`);
      return JSON.parse(content(res.stdout));
    }else{
      log(cmd); log(st);
      return null;
    }
  }).catch(err=>{
    log(`get job ${id} result\nERROR: `,err);
  });
}
function pose(p){
  var jsonp=`./pose/${path.parse(p).name}.json`;
  if(!fs.existsSync(jsonp)){
    return submitWrnch(p).then(getResultWrnch).then(res=>{
      if(res){
        fs.writeFile(jsonp,JSON.stringify(res,null,2),err=>{
          if(err) throw err;
          else log(`wrote ${jsonp}`);
        });
        return res;
      }else return null;
    });
  }else{
    return new Promise((resolve,reject)=>{
      fs.readFile(jsonp,(err,data)=>{
        if(err) throw err;
        log(`read ${jsonp}`);
        resolve(JSON.parse(data));
      });
    });
  }
}
function evaluate(p1,v1,p2,v2){
  log(p1,v1,p2,v2);
  return Promise.all([pose(p1),pose(v1),pose(p2),pose(v2)]).then(values=>{
    if(values[0]==null) return null;
    return algo.evaluate_loss(values[0],values[1],values[2],values[3]);
  }).catch(err=>{
    log(`evaluate\n${p1}\n${v1}\n${p2}\n${v2}\nERROR: ${err}`);
  });
}
app.post('/demo/evaluate',(req,res)=>{
  log('post evaluate');
  const form = formidable({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if(err){next(err);return;}
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
        log(pts);
        res.end(JSON.stringify(pts));
        log('post evaluate end');
      }).catch(e=>{
        log(e);
      });
    }catch(e){log(e);}
  });
});
log((new Date()).toLocaleString());
updateToken();
// setTimeout(()=>{evaluate(
//   './public/demo/demo-pict.png',
//   './public/demo/demo-video.mp4',
//   './data/1594461887480.png',
//   './data/1594462292424.mp4'
// ).then(pts=>{log(pts);});},2000);