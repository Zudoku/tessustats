'use strict'
var config = require('./config');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.DATABASE_PATH);
var util = require("util");
//http://i.imgur.com/PHlR21R.png

/* SQL script to create template DB file
 DROP TABLE online;
 DROP TABLE userdata;
 DROP TABLE serverdata;
 DROP TABLE scans;
 DROP TABLE lastscan;
 DROP TABLE channels;
 DROP TABLE activechannels;
 DROP TABLE statistics_OS;

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

INSERT INTO lastscan
(date,success,id)
values
('1900-01-01 11:11:11','Online',2);

CREATE TABLE scans
(
date datetime
);

CREATE TABLE channels
(
cid INTEGER,
pid INTEGER,
name TEXT,
topic TEXT,
description TEXT,
passwordprotected INTEGER,
orderT INTEGER,
type TEXT,
encryptedvoice INTEGER,
secondsempty INTEGER
);

CREATE TABLE activechannels
(
cid INTEGER
);

CREATE TABLE statistics_OS
(
name TEXT,
amount INTEGER
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
		var response = "";
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
				var rowText = "";
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
							rowText = toAdd;
						}else{
							rowText = rowText +"," + toAdd;
						}
						
					}
				}else{
					rowText = "0,0,0"; //No-one was online
				}
				response = response + dateObject + "," + rowText + "\n"; //Add the timestamp to the 4th row
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
	getUserList : () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT nickname,COUNT(*) as times,databaseid FROM online GROUP BY databaseid ORDER BY times DESC;", function(err, rows) {
				
				let users = rows;
				db.all("SELECT databaseid,country FROM userdata;",function(err, rows) {
					var result = users.map(obj => {
						obj.country = rows.find(x => x.databaseid == obj.databaseid).country.toLowerCase();
						return obj;
					});
					resolve(result);
				});
				
			});
		})
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
	getUserLastRecord : ( databaseid ) => {
		return new Promise((resolve, reject) => {
			db.all("SELECT *,COUNT(*) as times FROM online  WHERE databaseid = ? ORDER BY times DESC;",[databaseid], function(err, rows) {
				module.exports.getChannelNameFromCID(rows[0].channel).then( (name) => { 
					rows[0].channelname = name;
					resolve(rows[0]);
				})
			});
		})		
	}, //Gets the data of one user specified by parameter databaseid
	getUserData:( databaseid ) => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM userdata WHERE databaseid = ? ;",[databaseid], function(err, rows) {
				resolve(rows[0]);
			});
		})		
	}, //Get the server statistics
	getServerBasicInfo : () => {
		return new Promise((resolve, reject) => {
        	db.all("SELECT * FROM serverdata WHERE id = 1;", (err, rows) => {
				resolve(rows[0]);
			});
    	})
		
	}, //Updates server statistics
	insertServerData : function(serverObject){
		console.log('Updating Server information!');
		db.run("UPDATE serverdata SET name = ?, welcomemessage = ?, platform = ?, version = ?, ping = ?, packetloss = ?, maxclients = ?, uptime = ? WHERE id = 1",
				serverObject.name,serverObject.welcomemessage,serverObject.platform,serverObject.version,
				serverObject.ping,serverObject.packetloss,serverObject.maxclients,serverObject.uptime);
	}, //Updates the users data check tsparser.js for the structure for userObject.
	updateUserData: function(userObject){
		console.log('Saving clientinfo for user ',userObject.nickname, ' to database');
		//... sorry
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
		var formatDateEnd = ISODateString(new Date());
		db.run("UPDATE lastscan SET date = ?, success = ? WHERE id = 1",
				formatDate,scanObject.success);
		db.run("UPDATE lastscan SET date = ? WHERE id = 2",formatDateEnd);
		db.run("INSERT INTO scans (date) values (?)",formatDate);
		console.log('Scan logged!');
	},  //Get the information about the latest scan
	getLastScan : () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM lastscan;", function(err, rows) {
				resolve(rows);
			});
		})
	}, //Get the users that were online when the last scan was
	getLastScanClients : () => {
		return new Promise((resolve, reject) => {
			db.get("SELECT * FROM lastscan WHERE id = 1;", function(err, rows) {
				db.all("SELECT nickname,databaseid,channel FROM online WHERE date = ?",rows.date, function(err, clients) {
					resolve(clients);
				});
			});
		})
	}, //Get the most clients ever seen on the server
	getMostClientsSeen : () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT date,COUNT(*) as times FROM online GROUP BY date ORDER BY times DESC;", function(err, rows) {
				if(rows.length >= 1){
					resolve(rows[0]);
				}
				else{
					resolve(0);
				}
			});
		})
	},
	getAllCountries : () => {
		return new Promise((resolve, reject) => {
			var countries = [];
			db.all("SELECT * FROM userdata;",function(err,userdata){
				db.all("SELECT COUNT(*) as times,databaseid FROM online GROUP BY databaseid ORDER BY times DESC;", function(err, onlinedata) {
					userdata.map( (value) => {
						var userOnlineData = onlinedata.find( x => x.databaseid == value.databaseid);
						if(userOnlineData == undefined){
							console.log("Can't find user in both tables, userdata and online!");
						}else{
							var countryFindAttempt = countries.find( country => country.country == value.country);
							if(countryFindAttempt != undefined){
								var user = {
									databaseid: value.databaseid,
									username: value.nickname
								};
								countryFindAttempt.users.push(user);
								countryFindAttempt.activityscore += userOnlineData.times;
							}else{
								var country = {
									users : [],
									activityscore : 0,
									country : value.country
								};
								var user = {
									databaseid: value.databaseid,
									username: value.nickname
								};
								country.users.push(user);
								country.activityscore += userOnlineData.times;
								countries.push(country);
							}
						}
					});

					countries.sort(function (a,b){
						if(a.activityscore > b.activityscore){
							return -1;
						}else if(a.activityscore < b.activityscore){
							return 1;
						}else{
							return 0;
						}
					});

					resolve(countries);

				});
			});
		})
	},
	getUsersFromCountry : function(res,country){
		var result = [];
		var print = function() {
			res.send(result);
		};
		db.each("SELECT nickname,databaseid FROM userdata WHERE country=?;",country,function(err,row){
			result.push(row);
		},print);
	},
	updateChannelData : function(channelDBObject){
		console.log('handling ' + channelDBObject.cid + ' ' + channelDBObject.name)
		db.serialize(function() {
			db.get("SELECT * FROM channels WHERE cid = ?;",channelDBObject.cid,function(err,row){
				if(row===undefined){
					console.log('Inserting new channel');
					db.run("INSERT INTO channels (cid,pid,name,topic,description,passwordprotected,orderT,type,encryptedvoice,secondsempty) VALUES (?,?,?,?,?,?,?,?,?,?)",
							channelDBObject.cid,channelDBObject.pid,channelDBObject.name,channelDBObject.topic,channelDBObject.description,channelDBObject.passwordProtected,channelDBObject.order,
							channelDBObject.type,channelDBObject.encryptedVoice,channelDBObject.secondsEmpty);
				}else{
					console.log('Updating existing channel');
					db.run("UPDATE channels SET pid = ?, name = ?, topic = ?, description = ?, passwordprotected = ?, orderT = ?, type = ?, encryptedvoice = ?, secondsempty = ? WHERE cid = ?",
							channelDBObject.pid,channelDBObject.name,channelDBObject.topic,channelDBObject.description,channelDBObject.passwordProtected,channelDBObject.order,
							channelDBObject.type,channelDBObject.encryptedVoice,channelDBObject.secondsEmpty,channelDBObject.cid);
				}
			});
		});
	},
	getChannelNameFromCID : (cid) => {
		return new Promise((resolve, reject) => {
			db.get("SELECT name FROM channels WHERE cid = ?;",cid,function(err,row){
				resolve(row.name);
			});
		})
	},
	getAllActiveChannels : () => {
		return new Promise((resolve, reject) => {

			var resultChannels = [];

			db.all("SELECT * FROM channels;",function(err,channels){
				db.all("SELECT * FROM activechannels;",function(err,activeChannels){
					//Hours wasted sorting them to right order: 4
					resultChannels = activeChannels.map( (value) => {
						var channel = channels.find( x => x.cid == value.cid);
						var finding = true;
						var channelLevel = 0;
						var handledChannel = channel;
						if(channel == undefined){
							return {};
						}
						while(finding){
							var parentCID = handledChannel.pid;
							if(parentCID == 0){
								finding = false;
								channel.channellevel = channelLevel;
								return channel;
							}
							var parent = channels.find( y => y.cid == parentCID);
							if(parent == undefined){
								channelLevel = 0;
								finding = false;
								channel.channellevel = channelLevel;
								return channel;

							}else{
								channelLevel++;
								handledChannel = parent;
							}
						}
						

					});
					var modifiedList = false;

					function addChildrenChannels(list,channelLevel){
						var result = [];
						var index = 0;
						modifiedList = false;
						while(true){
							if(index == list.length -1){
								return result;
								break;
							}
							var channel = list[index];
							if(channel.channellevel < channelLevel){
								result.push(channel);
							}
							if(channel.channellevel == channelLevel){
								result.push(channel);
								var channelsToBeAdded = getChildrenChannels(channel.cid);
								if(channelsToBeAdded.length != 0){
									modifiedList = true;
									for(var c = 0 ; c < channelsToBeAdded.length; c++){
										result.push(channelsToBeAdded[c]);
									}
								}
								
							}
							index++;
						}
						
					};
					function getChildrenChannels(cid){
						var result = resultChannels.filter(function(filteredChannel){
							if(filteredChannel.pid == cid){
								return true;
							}
							return false;
						});
						result.sort(function(a,b){
							if(a.orderT == 0){
								return -1;
							}
							if(b.orderT == 0){
								return 1;
							}
							if(a.orderT == b.cid){
								return 1;
							}
							if(b.orderT == a.cid){
								return -1;
							}

						});

						return result;

					};
					var start = resultChannels.filter(function(filteredChannel){
						if(filteredChannel.pid == 0){
							return true;
						}
						return false;
					});
					var sortedStart = [];
					var currentChannel;
					for(var t = 0; t < start.length; t++){
						if(start[t].pid == 0 && start[t].orderT == 0){
							currentChannel = start[t];
						}
					}
					sortedStart.push(currentChannel);
					while(true){
						var found = false;
						for(var t = 0; t < start.length; t++){
							if(start[t].orderT == currentChannel.cid){
								sortedStart.push(start[t]);
								currentChannel = start[t];
								found = true;

							}
						}
						if(!found){
							break;
						}
					}

					var channelLevel = 0;
					while(true){

						var startNew = addChildrenChannels(sortedStart,channelLevel);
						sortedStart = startNew;
						if(!modifiedList){
							break;
						}
						channelLevel++;
					}
					

					resolve(sortedStart);
				});
				
			});
		})
	},
	getChannelData : (cid) => {
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM channels WHERE cid = ?;",cid,function(err,rows){
				if(rows.length != 0){
					resolve(rows[0]);
				}else{
					resolve([]);
				}
				
			});
		})
	},
	updateActiveChannels : function(activeChannels){
		var inserting = function(){
			for(var p= 0; p < activeChannels.length ; p++){
				db.run("INSERT INTO activechannels (cid) VALUES (?)",activeChannels[p]);
			}
		};
		db.run("DELETE FROM activechannels;",inserting);
		
		
	},
	getAllUsersCountry : () => {
		return new Promise((resolve, reject) => {
			db.all("SELECT country,databaseid FROM userdata;",function(err,rows){
				resolve(rows);
			});
		})
	},
	getUsersAmount : () => { //TODO: optimize
		return new Promise((resolve, reject) => {
			db.all("SELECT databaseid FROM userdata;",function(err,rows){
				resolve(rows.length);
			});
		})
	},
	getScansAmount : () => { //TODO: optimize
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM scans;",function(err,rows){
				resolve(rows.length);
			});
		})
	},
	getActiveChannelsAmount : () => { //TODO: optimize
		return new Promise((resolve, reject) => {
			db.all("SELECT cid FROM activechannels;",function(err,rows){
				resolve(rows.length);
			});
		})
	},
	getChannelsAmount : () => { //TODO: optimize
		return new Promise((resolve, reject) => {
			db.all("SELECT cid FROM channels;",function(err,rows){
				resolve(rows.length);
			});
		})
	},
	getCombinedActivityScore : function(res){
		var result = [];
		var print = function() {
			res.send(result[0]);
		};
		db.each("SELECT COUNT(*) as times FROM online;",function(err,row){
			result.push(row);
		},print);
	},
	getInactiveChannels : function(res){
		var active = [];
		var channels = [];
		var print = function() {
			res.send(channels);
		};
		var query = function(){

			db.each("SELECT cid,name FROM channels;",function(err,row){
				if(active.indexOf(row.cid) == -1){
					channels.push(row);
				}
				
				
			},print);
		};
		db.each("SELECT * FROM activechannels;",function(err,row){
			active.push(row.cid);
		},query);
	},
	getIsUserOnline : (databaseid) => { 
		return new Promise((resolve, reject) => {
			db.all("SELECT * FROM lastscan WHERE id = 1;", function(err, rows) {
				var results = rows.find(x => x.databaseid == databaseid);
				resolve(results != undefined);
			});
		})
	},
	getUserActivityScore : (databaseid) => { 
		return new Promise((resolve, reject) => {
			db.all("SELECT nickname,COUNT(*) as times,databaseid FROM online GROUP BY databaseid ORDER BY times DESC;", function(err, rows) {
				for(var y = 0 ; y < rows.length ; y++){
					if(rows[y].databaseid == databaseid){
						resolve({rank : y + 1 , score: rows[y].times});
						break;
					}
				}
				resolve(-1);
			});
		})
	},
	getUserPieChart : (databaseid) => { 
		return new Promise((resolve, reject) => {
			db.all("SELECT databaseid,COUNT(*) as times,channel FROM online WHERE databaseid=? GROUP BY databaseid,channel ORDER BY times DESC;",[databaseid], function(err, rows) {

				db.all("SELECT * FROM channels;", function(err,channels){
					var result = rows;
					for( var x = 0 ; x < rows.length; x++){
						var foundChannel = channels.find( u => u.cid == rows[x].channel);
						if(foundChannel != undefined){
							result[x].channelname = channels.find( u => u.cid == rows[x].channel).name;
						}else{
							result[x].channelname = "";
						}
						
						result[x].y = result[x].times;
						result[x].times = undefined;
					}
					if(result.length > 5){
						resolve(result);
					}else{
						resolve(result);
					}
				});
				
			});
		})
	},
	getCountryData : (country) => {
		return new Promise((resolve, reject) => {
			module.exports.getAllCountries().then( (countries) => {
				var foundCountry = countries.find( x => x.country.toLowerCase() == country.toLowerCase());
				resolve(foundCountry);
			});

		})
	},
	getMostActiveChannelsFromThisWeek : () => {
		return new Promise((resolve, reject) => {
			var result = [];
			db.all("SELECT cid,name from channels;", function(err, channels){
				db.all("SELECT COUNT(*) as times,channel FROM online WHERE date>date('now','-7 days') GROUP BY channel ORDER BY times DESC;",function(err,mostActive){
					var topActive = mostActive.splice(0,5);
					for(var t = 0 ; t < topActive.length; t++){
						var channelObject = channels.find(x => x.cid == topActive[t].channel);
						channelObject.activityscore = topActive[t].times;
						result.push(channelObject);
					}
					resolve(result);
				});
			});
		})
	},
	isMostActiveChannelThisWeek : (cid) => {
		return new Promise((resolve, reject) => {
			module.exports.getMostActiveChannelsFromThisWeek().then( (channels) => {
				var searchAttempt = channels.find( c => c.cid == cid);
				if(searchAttempt != undefined){
					resolve(true);
				}else{
					resolve(false);
				}
				
			});
		})
	},
	getChannelActiveUsers : (cid) => {
		return new Promise((resolve, reject) => {
			db.all("SELECT COUNT(*) as times,databaseid,nickname FROM online WHERE channel = ? GROUP BY databaseid ORDER BY times DESC;", [cid], function(err,rows){
				if(rows.length != 0){
					var result = rows.splice(0,5);
					resolve(result);
				}else{
					resolve([]);
				}
			});
		})
	}

}
