
var webserver_port = 3700;
var webserver_bind = '127.0.0.1';

var TIMEOUT_BETWEEN_SCANS = 300000;

var express = require('express');
var app = express();
var database=require('./database.js');
var tsparser=require('./tsparser.js');

console.log("Modules loaded succesfully!");

tsparser.setdb(database);

console.log("Database configured!");

app.use("/app/", express.static(__dirname + '/app'));
app.get('/query/serverActivityChart/:timeframe', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.getActivityChartData(res,req.params.timeframe);
  
});
app.get('/query/scanTimesDay', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.getScanTimesDay(res);
  
});

app.get('/query/allusers', function(req, res){
	
	database.allUsersData(res);
  
});
app.get('/query/user/:databaseid',function(req,res){
	database.getUserData(res,req.params.databaseid);
	
});
app.get('/query/serverdata',function(req,res){
	database.getServerData(res);
	
});

app.get('/query/latestrecord/:databaseid',function(req,res){
	database.getUsersLastRecord(res,req.params.databaseid);
});
app.get('/query/lastscan',function(req,res){
	database.getLastScan(res);
});
app.get('/query/lastscanclients',function(req,res){
	database.getLastScanClients(res);
});
app.get('/query/getmostclientsseen',function(req,res){
	database.getMostClientsSeen(res);
});
app.get('/query/allcountries',function(req,res){
	database.getAllCountries(res);
});
app.get('/query/allClientsFromCountry/:country',function(req,res){
	database.getUsersFromCountry(res,req.params.country);
});
app.get('/query/getAllActiveChannels',function(req,res){
	database.getAllActiveChannels(res);
});
app.get('/query/channel/:cid',function(req,res){
	database.getChannelData(res,req.params.cid);
});
app.get('/query/getAllUsersCountry',function(req,res){
	database.getAllUsersCountry(res);
});

//Redirect / to /app/
app.get('/', function(req,res){
	res.redirect('/app/');
});

console.log("Server starting!");

app.listen(webserver_port,webserver_bind);

console.log("Server running at ",webserver_bind,":",webserver_port);

console.log("Starting scanning TS every " + TIMEOUT_BETWEEN_SCANS + " seconds");
tsparser.keepScanning(TIMEOUT_BETWEEN_SCANS);

