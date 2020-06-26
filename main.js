const express=require('express');
const bodyParser=require('body-parser');
const mongo=require('mongodb').MongoClient;

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