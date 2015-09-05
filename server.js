
var config = require('./config');
var express = require('express');
var app = express();
var database=require('./database.js');
var tsparser=require('./tsparser.js');
var blogAPI = require('./blogAPI.js');

console.log("Modules loaded succesfully!");

tsparser.setdb(database);

console.log("Database configured!");

app.use("/app/", express.static(__dirname + '/app'));

//TESSU STATS
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
app.get('/query/usersAmount',function(req,res){
	database.getUsersAmount(res);
});
app.get('/query/scansAmount',function(req,res){
	database.getScansAmount(res);
});
app.get('/query/activeChannelsAmount',function(req,res){
	database.getActiveChannelsAmount(res);
});
app.get('/query/channelsAmount',function(req,res){
	database.getChannelsAmount(res);
});
app.get('/query/channelname/:cid',function(req,res){
	database.getChannelNameFromCID(res,req.params.cid);
});
app.get('/query/combinedActivityScore',function(req,res){
	database.getCombinedActivityScore(res);
}); 
app.get('/query/getInactiveChannels',function(req,res){
	database.getInactiveChannels(res);
});

//BLOG 
app.get('/query/blog/article/:id',function(req,res){
	blogAPI.getArticle(res,req.params.id);
});
app.get('/query/blog/articleList',function(req,res){
	blogAPI.getArticleList(res);
});

//Redirect / to /app/
app.get('/', function(req,res){
	res.redirect('/app/');
});
//Redirect /blog to /app/blog.html
app.get('/blog', function(req,res){
	res.redirect('/app/blog.html');
});

console.log("Server starting!");

app.listen(config.webserver_port,config.webserver_bind);

console.log("Server running at ",config.webserver_bind,":",config.webserver_port);

console.log("Starting scanning TS every " + config.TIMEOUT_BETWEEN_SCANS + " seconds");
tsparser.keepScanning(config.TIMEOUT_BETWEEN_SCANS);

