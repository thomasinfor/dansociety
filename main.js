const express=require('express');

const port=3000;
const app=new express();

app.get('/', function(req, res){
    res.sendFile('./index.html',{"root":__dirname});
}).listen(port,()=>{console.log('Server running at localhost:'+port);});