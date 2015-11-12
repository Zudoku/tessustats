'use strict'

var config = require('../server/config');
var express = require('express');
var app = express();
var database=require('../server/database');
var tsparser=require('../server/tsparser');
var blogAPI = require('../blog/blogAPI');

console.log("Modules loaded succesfully!");

tsparser.setdb(database);

console.log("Database configured!");

app.use("/app/", express.static(__dirname + '/../app'));

//The API handler for /server
app.get('/query/serverpage', (req,res) => {
	Promise.all([
		database.getServerBasicInfo(),
		database.getLastScan(),
		database.getLastScanClients(),
		database.getMostClientsSeen(),
		database.getUsersAmount(),
		database.getScansAmount(),
		database.getActiveChannelsAmount(),
		database.getChannelsAmount()

	]).then(function(data) {
		var response = {};
		response.basicinfo = data[0];
		response.lastscan = data[1];
		response.lastscanCO = data[2].length; //TODO: make own function to optimize
		response.mostclients = data[3];
		response.clientamount = data[4];
		response.scanamount = data[5];
		response.activechannels = data[6];
		response.channelamount = data[7];
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});
//The API handler for /users
app.get('/query/userspage', (req,res) => {
	Promise.all([
		database.getUserList(),
		database.getLastScanClients(),
		database.getUsersAmount(),

	]).then(function(data) {
		var response = {};
		response.userlist = data[0];
		response.lastscanclients = data[1];
		console.log(data[1]);
		response.clientamount = data[2];

		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});
//The API handler for /user
app.get('/query/userpage/:databaseid', (req,res) => {
	Promise.all([
		database.getUserData(req.params.databaseid),
		database.getUserLastRecord(req.params.databaseid),
		database.getIsUserOnline(req.params.databaseid),
		database.getUserActivityScore(req.params.databaseid),
		database.getUserPieChart(req.params.databaseid)

	]).then(function(data) {
		var response = {};
		response.info = data[0];
		response.userlastrecord = data[1];
		response.isonline = data[2];
		response.activityscore = data[3];
		response.piechart = data[4];

		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});
//The API handler for /countries
app.get('/query/countriespage', (req,res) => {
	Promise.all([
		database.getAllCountries(),
		database.getUsersAmount()

	]).then(function(data) {
		var response = {};
		response.countries = data[0];
		response.clientamount = data[1];

		
		//Count the combined activityscore
		var combinedActivityScore = 0;
		response.countries.map(function(value){
			combinedActivityScore += value.activityscore;
		});
		response.combinedActivityScore = combinedActivityScore;
		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});

//The API handler for /country/:countrycode
app.get('/query/countrypage/:countrycode', (req,res) => {
	Promise.all([
		database.getAllCountries(),
		database.getUsersAmount(),
		database.getCountryData(req.params.countrycode)
		

	]).then(function(data) {
		var response = {};
		response.clientamount = data[1];
		response.countrydata = data[2];

		response.combinedActivityScore = 0;
		for(var b = 0 ; b < data[0].length ; b++){
			response.combinedActivityScore += data[0][b].activityscore;
			if(data[0][b].country.toLowerCase() == req.params.countrycode.toLowerCase()){
				response.rank = b;
			}
		}

		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});

//The API handler for /channels/
app.get('/query/channelspage', (req,res) => {
	Promise.all([
		database.getAllActiveChannels(),
		database.getLastScanClients(),
		database.getMostActiveChannelsFromThisWeek()
		

	]).then(function(data) {
		var response = {};
		response.activeChannels = data[0];
		response.lastscanclients = data[1];
		response.mostActive = data[2];
		
		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});

//The API handler for /channel/:cid
app.get('/query/channelpage/:cid', (req,res) => {
	Promise.all([
		database.getChannelData(req.params.cid),
		database.isMostActiveChannelThisWeek(req.params.cid),
		database.getChannelActiveUsers(req.params.cid)

	]).then(function(data) {
		var response = {};
		response.channelinfo = data[0];
		response.ismostactivethisweek = data[1];
		response.activeusers = data[2];
		
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
});



//TESSU STATS
app.get('/query/serverActivityChart/:timeframe', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.getActivityChartData(res,req.params.timeframe);
});
app.get('/query/scanTimesDay', function(req, res){
	res.set('Content-Type', 'text/plain');
	database.getScanTimesDay(res);
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

