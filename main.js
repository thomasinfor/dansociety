const express=require('express');
const bodyParser = require('body-parser');

const port=2003;
const app=new express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',function(req,res){
    res.sendFile('./index.html',{"root":__dirname});
}).listen(port,()=>{console.log('Server running at localhost:'+port);});

app.post('/subscribe',(req,res)=>{
	console.log(req.body);
	res.send('jizz');
})