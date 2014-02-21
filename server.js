var express = require('express');
var app = express();
var database=require('./database.js');
var tsparser=require('./tsparser.js');

tsparser.setdb(database);
app.use("/", express.static(__dirname + '/app'));
app.get('/test', function(req, res){
	
	database.selectAll(res);
  
});
app.get('/chartdata', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.chartData(res);
  
});
app.get('/allusers', function(req, res){
	
	database.allUsersData(res);
  
});
app.get('/user/:databaseid',function(req,res){
	database.getUserData(res,req.params.databaseid);
	
});


app.listen(3600);
