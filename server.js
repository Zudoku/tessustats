var express = require('express');
var app = express();
var database=require('./database.js');
var tsparser=require('./tsparser.js');

tsparser.setdb(database);
app.use("/app/", express.static(__dirname + '/app'));
app.use("/intopark/", express.static(__dirname + '/intopark'));
app.get('/chartdata', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.chartData(res);
  
});
app.get('/allusers', function(req, res){
	
	database.allUsersData(res);
  
});
app.get('/intopark',function(req,res){
	res.send('/pages/intopark.html');
});
app.get('/user/:databaseid',function(req,res){
	database.getUserData(res,req.params.databaseid);
	
});


app.listen(3700);
