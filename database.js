var DATABASE_PATH = 'db';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_PATH);
var util = require("util");;
//http://i.imgur.com/PHlR21R.png

/* SQL script to create template DB file
 DROP TABLE online;
 DROP TABLE userdata;

 CREATE TABLE online
 (
 databaseid INTEGER,
 nickname var char(20),
 date datetime,
 inputmuted BOOLEAN,
 outputmuted BOOLEAN,
 channel INTEGER
 );

 CREATE TABLE userdata
 (
 databaseid INTEGER,
 nickname var char(20),
 os TEXT,
 country TEXT,
 clientversion TEXT,
 totalconnections INTEGER,
 rank TEXT,
 lastconnected INTEGER,
 bytesuploadedmonth INTEGER,
 bytesdownloadedmonth INTEGER,
 bytesuploadedtotal INTEGER,
 bytesdownloadedtotal INTEGER,
 talkpower INTEGER,
 badges TEXT
 );

CREATE TABLE serverdata
(
name TEXT,
welcomemessage TEXT,
platform TEXT,
version TEXT,
ping INTEGER,
packetloss REAL,
maxclients INTEGER,
uptime INTEGER,
id INTEGER
);

INSERT INTO serverdata 
(name,welcomemessage,platform,version,ping,packetloss,maxclients,uptime,id)
values
('tempname','welcome','platform xyz','version xyz',100,0.55,32,10000,1);

CREATE TABLE lastscan
(
date datetime,
success TEXT,
id INTEGER
);

INSERT INTO lastscan
(date,success,id)
values
('1900-01-01 11:11:11','Online',1);

CREATE TABLE scans
(
date datetime
);
 */

console.log("Database found: \n",db);

function ISODateString(d) {
	function pad(n) {
		return n < 10 ? '0' + n : n
	}
	return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-'
			+ pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':'
			+ pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
}

module.exports = {
		//Adds online stamp for 1 user. Gets called when user is spotted on the server 
	addOnlineRecord : function(onlineRecordObject) {
		var formatDate = ISODateString(onlineRecordObject.date);

		console.log("Nickname: "+ onlineRecordObject.nickname +" DatabaseID: "+ onlineRecordObject.databaseid +" recorded online");
		db.run('INSERT INTO online (databaseid,nickname,date,inputmuted,outputmuted,channel) VALUES (?,?,?,?,?,?)',
			onlineRecordObject.databaseid, onlineRecordObject.nickname, formatDate,
			onlineRecordObject.inputmuted,onlineRecordObject.outputmuted,onlineRecordObject.channel);

	},//Closes the database connection
	close : function() {
		db.close();
	},//Returns the activity chart data (CSV format, rows) for either day,week or month depending on identifier parameter
	getActivityChartData : function(res,identifier) {
		var queryResult = [];
		var scans = [];
		var response="0,1,2,time\n";
		var rowString;
		//Query datetime range
		var timelineStart = "";
		var timelineEnd = "";
		
		if(identifier === "month"){
			timelineStart = "datetime('now','-1 months')";
			timelineEnd = "datetime('now')";
		}else if(identifier === "week"){
			timelineStart = "datetime('now','-7 days')";
			timelineEnd = "datetime('now')";
		}else{
			timelineStart = "datetime('now','-1 days')";
			timelineEnd = "datetime('now')";
		}
		//make a CSV file out of the SQL queries , Gets executed last
		//CSV file is in rows.In rows we have the number of  active , muted and all muted. Then we have timestamp row
		//Because we have times when there isnt always atleasst one of each, we need to take that into consideration and fill that place with 0
		var print = function() {
			var dictionary = {};
			for (var i = 0; i < queryResult.length; i++) { 
				//Put all online data into a dictionary where key is timestamp of scan
				//and value is an array of all the values
				if(dictionary[queryResult[i].date] != null){
					dictionary[queryResult[i].date].push(queryResult[i]);
				}else{
					var a = [];
					a.push(queryResult[i]);
					dictionary[queryResult[i].date] = a;
				}
			}
			for (var i = 0; i < scans.length; i++) { //Loop trough all the scans and go trough the dictionary with them
				var dateObject = Date.parse(scans[i])/1000;
				if(dictionary[dateObject.toString()] != null){
					var a = dictionary[dateObject.toString()];
					for(var activity = 0 ; activity < 3 ; activity++){ //Go trough active online, muted online , all muted online and comma separate them and add them to the response
						
						var matchfound = false;
						var toAdd = "0";
						for(var index = 0 ; index < a.length;  index++){
							if(a[index].activity === activity){
								toAdd = a[index].count.toString();
								matchfound = true;
								break;
							}
						}
						if(activity === 0){
							response = response + toAdd;
						}else{
							response = response +"," + toAdd;
						}
						
					}
				}else{
					response = response + "0,0,0"; //No-one was online
				}
				response = response +"," + dateObject + "\n"; //Add the timestamp to the 4th row
			}
			
			
			res.send(response);
		};
		//This is not optimal at all. I could not find a way to insert the values using ? or anything. It is safe though either way since it only adds a string constant into it.
		//query scans from the timeline, gets executed second
		var scanQueryString = "SELECT date FROM scans WHERE "+timelineStart+"<date AND date<"+timelineEnd+" ORDER BY date;";
		var queryScans = function(){
			db.each(scanQueryString,
					function(err,row){
				scans.push(row.date);
			},print);
		};
		
		var r;
		//This is not optimal at all. I could not find a way to insert the values using ? or anything. It is safe though either way since it only adds a string constant into it and not user input.
		//query who was online from the timeline,gets executed first
		var onlineQueryString = "SELECT inputmuted,outputmuted, COUNT(*) as count,date as date FROM online WHERE "+timelineStart+"<date AND date<"+timelineEnd+" GROUP BY date,inputmuted,outputmuted ORDER BY date;";
		db.each(
			onlineQueryString,
			function (err, row) {
				r = {};
				var dateObject = Date.parse(row.date)/1000;
				r.date = dateObject;
				var activity = 0;
				if(row.inputmuted && row.outputmuted || !row.inputmuted && row.outputmuted){activity = 2;}
				if(row.inputmuted && !row.outputmuted){activity = 1;}
				r.activity = activity;
				r.count = row.count;
				
				queryResult.push(r);
			}, queryScans);
	},//Get the scans made in 24 hours
	getScanTimesDay : function(res){
		var scans = {};
		scans.scanTimes = [];
		var print = function() {
			res.send(scans);
		};
		db.each("SELECT date FROM scans WHERE date>date('now','-1 days') ORDER BY date;",
					function(err,row){scans.scanTimes.push(row.date);},print);
		
	},//Get the user list of all visited clients
	allUsersData:function(res){
		var arr = [];
		var print = function() {
			res.send(arr);
		};

		db.each("SELECT nickname,COUNT(*) as times,databaseid FROM online GROUP BY nickname ORDER BY times DESC;", function(err, row) {
			arr.push(row);
		}, print);
	}, //Get all users latest nickname
	allUsersID:function(){
		var arr = [];
		var print = function() {
			console.log(arr);
		};
		db.each("SELECT nickname,databaseid FROM online GROUP BY clientid;", function(err, row) {
			arr.push(row);
		},print);
	}, //Get the last record of the client with the parameter databaseid
	getUsersLastRecord : function(res,databaseid){
		var arr = [];
		var print = function() {
			if(arr.length >= 1){
				res.send(arr[0]);
			}
			else{
				res.send('');
			}

		};
		db.each("SELECT *,COUNT(*) as times FROM online  WHERE databaseid = ? ORDER BY times DESC;",[databaseid], function(err, row) {
			arr.push(row);
		},print);
	}, //Gets the data of one user specified by parameter databaseid
	getUserData:function(res,databaseid){
		var arr = [];
		var print = function() {
			//Add the flagCode
			try{
				arr[0].flagCode = arr[0].country.toLowerCase();
			}catch(error){
				console.log(error);
			}
			res.send(arr[0]);
		};
		db.each("SELECT * FROM userdata WHERE databaseid = ? ;",[databaseid], function(err, row) {
			arr.push(row);
		},print);
	}, //Get the server statistics
	getServerData : function(res){
		var arr = [];
		var print = function() {
			res.send(arr[0]);
		};
		db.each("SELECT * FROM serverdata WHERE id = 1;", function(err, row) {
			arr.push(row);
		},print);
	}, //Updates server statistics
	insertServerData : function(serverObject){
		console.log('Updating Server information!');
		db.run("UPDATE serverdata SET name = ?, welcomemessage = ?, platform = ?, version = ?, ping = ?, packetloss = ?, maxclients = ?, uptime = ? WHERE id = 1",
				serverObject.name,serverObject.welcomemessage,serverObject.platform,serverObject.version,
				serverObject.ping,serverObject.packetloss,serverObject.maxclients,serverObject.uptime);
	}, //Updates the users data check tsparser.js for the structure for userObject.
	updateUserData: function(userObject){
		console.log('Saving clientinfo for user ',userObject.nickname, ' to database');

		db.serialize(function() {
			db.get("SELECT * FROM userdata WHERE databaseid = ?;",userObject.databaseid,function(err,row){
				if(row===undefined){
					console.log('Inserting new user!');
					db.run("INSERT INTO userdata (databaseid,nickname,os,country,clientversion,totalconnections," +
						"rank,lastconnected,bytesuploadedmonth,bytesdownloadedmonth,bytesuploadedtotal,bytesdownloadedtotal,talkpower,badges)" +
						" VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
						userObject.databaseid,userObject.nickname,userObject.os,userObject.country,userObject.clientversion,userObject.totalconnections,
						userObject.rank,userObject.lastconnected,userObject.bytesuploadedmonth,userObject.bytesdownloadedmonth,userObject.bytesuploadedtotal,
						userObject.bytesdownloadedtotal,userObject.talkpower,userObject.badges);
				}else{
					console.log('Updating existing user!');

					db.run("UPDATE userdata SET nickname = ?,os = ?,country = ?,clientversion = ?,totalconnections = ?,rank = ?,lastconnected = ?," +
						"bytesuploadedmonth = ?,bytesdownloadedmonth = ?,bytesuploadedtotal = ?,bytesdownloadedtotal = ?,talkpower = ?,badges = ? WHERE databaseid = ?",
						userObject.nickname,userObject.os,userObject.country,userObject.clientversion,userObject.totalconnections,
						userObject.rank,userObject.lastconnected,userObject.bytesuploadedmonth,userObject.bytesdownloadedmonth,userObject.bytesuploadedtotal,
						userObject.bytesdownloadedtotal,userObject.talkpower,userObject.badges,userObject.databaseid);
				}
			});
		});

		
	}, //Logs new scan
	logScan : function(scanObject){
		var formatDate = ISODateString(scanObject.date);
		db.run("UPDATE lastscan SET date = ?, success = ? WHERE id = 1",
				formatDate,scanObject.success);
		db.run("INSERT INTO scans (date) values (?)",formatDate);
		console.log('Scan logged!');
	},  //Get the information about the latest scan
	getLastScan : function(res){
		var arr = [];
		var print = function() {
			res.send(arr[0]);
		};
		db.each("SELECT * FROM lastscan WHERE id = 1;", function(err, row) {
			arr.push(row);
		},print);
	}, //Get the users that were online when the last scan was
	getLastScanClients : function(res){
		var response = [];
		var lastscan = [];
		var print = function() {
			res.send(response);
		};
		var queryclients = function() {
			db.each("SELECT nickname,databaseid FROM online WHERE date = ?",lastscan[0].date, function(err, row) {
				response.push(row);
			},print);
		};
		db.each("SELECT * FROM lastscan WHERE id = 1;", function(err, row) {
			lastscan.push(row);
		},queryclients);
	}, //Get the most clients ever seen on the server
	getMostClientsSeen : function(res){
		var arr = [];
		var print = function() {
			res.send(arr[0]);
		};
		db.each("SELECT date,COUNT(*) as times FROM online GROUP BY date ORDER BY times DESC;", function(err, row) {
			arr.push(row);
		},print);
	}
	

}
