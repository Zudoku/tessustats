'use strict'

var config = require('../server/config');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var database=require('../server/database');
var tsparser=require('../server/tsparser');

console.log("Modules loaded succesfully!");

tsparser.setdb(database);

console.log("Database configured!");
app.use(bodyParser.json());
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


//The API handler for registration
app.get('/registration/new/:uniqueID', (req,res) => {

	var uniqueID = req.params.uniqueID;
	console.log(req.ip + " tried to register " + uniqueID);

	tsparser.loginIfNeeded().then(function(result){
		tsparser.tryRegister(uniqueID).then(function(result){
			res.json(result);
		}, (err) => {
			res.json(err);
		});
	}, (err) => {
		res.json(err);
	});
	
});

app.get('/registration/confirm/:uniqueID/:databaseID/:authguid', (req,res) => {

	var uniqueID = req.params.uniqueID;
	var databaseID = req.params.databaseID;
	var authguid = req.params.authguid;
	console.log(req.ip + " tried to confirm register " + uniqueID + " " + authguid);

	database.completeRegistration(databaseID,uniqueID,authguid).then(function(result){
		res.json(result);
	}, (err) => {
		res.json(err);
	});
	
});

app.get('/query/forumView/', (req,res) => {


	Promise.all([
		database.getLatestForumPosts(0)

	]).then(function(data) {
		var response = {};
		response.forumPosts = data[0];
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
	
});

app.get('/query/forum/auth/:authguid', (req,res) => {

	var authguid = req.params.authguid;

	database.authenticate(authguid).then(function(result){
		res.json(result);
	}, (err) => {
		res.json(err);
	});
	
});


//The API handler for /forum/post/
app.get('/query/forum/post/:postID', (req,res) => {

	var postID = req.params.postID;
	

	Promise.all([
		database.getForumPostDataWithID(postID),
		database.getForumCommentsWithID(postID)

	]).then(function(data) {
		var response = {};
		response.forumPost = data[0];
		response.editable = false;
		response.comments = data[1];
		res.json(response);
		
	}, (err) => {
    	console.log(`error: ${err}`)
    	res.json({error: 1});
	})
	
});

app.get('/forum/editPost/:postID', (req,res) => {

	var postID = req.params.postID;
	var post = req.body;

	console.log(JSON.stringify(post));

	res.json({});
	
	
});

app.get('/forum/newPost', (req,res) => {

	var post = req.body;
	console.log(JSON.stringify(post));

	//Validate forum post
	if(post.category == undefined || post.category == ""){
		res.json({
			success : false,
			message : "Please give the post a valid category"
		});
		return;
	}
	if(post.title == undefined || post.title == ""){
		res.json({
			success : false,
			message : "Please give the post a valid title"
		});
		return;
	}
	if(post.text == undefined || post.text == ""){
		res.json({
			success : false,
			message : "Your post is empty"
		});
		return;
	}



	//Check authentication
	var authguid = post.authentication;

	database.authenticate(authguid).then(function(data) {
		if(!data.success){
			res.json({
				success : false,
				message : "Please log in!"
			});
		} else{
			database.addNewForumPost(data.row.databaseID,post.category,post.title,post.text).then(function(forumData) {
				res.json(forumData);
			}, (error) => {
				res.json({
					success : false,
					message : "Error : " + error.msg
				});
			});
		}
	}, (error) => {
		res.json({
			success : false,
			message : "Error : " + error.msg
		});
	});
	
});


app.get('/forum/newComment', (req,res) => {

	var commentData = req.body;
	console.log(JSON.stringify(commentData));

	//Validate comment
	if(commentData.comment == undefined || commentData.comment == ""){
		res.json({
			success : false,
			message : "Your comment is empty"
		});
		return;
	}

	//Validate postID
	database.getForumPostDataWithID(commentData.postID).then(function(forumDataQuery){
		if(forumDataQuery != undefined){
			//postID is valid
			//Check authentication

			database.authenticate(commentData.authentication.authguid).then(function(data) {
				if(!data.success){
					res.json({
						success : false,
						message : "Please log in!"
					});
				} else{
					database.addNewComment(commentData.authentication.databaseID,commentData.comment,commentData.postID).then(function(data){
						res.json(data);
					}, (err) => {
						res.json({
							success : false,
							message : "Error: " + err.msg
						});
					});
				}
			}, (error) => {
				res.json({
					success : false,
					message : "Error : " + error.msg
				});
			});

		} else {
			res.json({
				success : false,
				message : "Can't find such forum post"
			});
		}
	}, (error) => {
		res.json({
			success : false,
			message : "Error: " + error
		});
	});
	
});

app.get('/forum/editComment', (req,res) => {

	var post = req.body;

	console.log(JSON.stringify(post));

	res.json({});
	
});

app.get('/query/names', (req,res) => {

	var ids = req.body.ids;

	console.log(JSON.stringify(ids));

	database.getUserNamesFromDatabaseIDs(ids).then(function(data) {
		res.json(data);
	}, (error) => {
		res.json({
			success : false,
			message : "Error: " + error
		});
	});
	
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

//Redirect / to /app/
app.get('/', function(req,res){
	res.redirect('/app/');
});


console.log("Server starting!");

app.listen(config.webserver_port,config.webserver_bind);

console.log("Server running at ",config.webserver_bind,":",config.webserver_port);

console.log("Starting scanning TS every " + config.timeout_between_scans + " seconds");
tsparser.keepScanning(config.timeout_between_scans);

