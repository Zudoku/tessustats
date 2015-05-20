
var webserver_port = 3700;

var TIMEOUT_BETWEEN_SCANS = 300000;

var express = require('express');
var app = express();
var database=require('./database.js');
var tsparser=require('./tsparser.js');

console.log("Modules loaded succesfully!");

tsparser.setdb(database);

console.log("Database configured!");

app.use("/app/", express.static(__dirname + '/app'));
//app.use("/intopark/", express.static(__dirname + '/intopark'));
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

console.log("Server starting!");

app.listen(webserver_port,'127.0.0.1');

console.log("Server running at ",webserver_port);

console.log("Starting scanning TS every " + TIMEOUT_BETWEEN_SCANS + " Seconds");
tsparser.keepScanning(TIMEOUT_BETWEEN_SCANS);

