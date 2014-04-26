var debug = false;
var TeamSpeakClient = require("node-teamspeak"), util = require("util");

var cl = new TeamSpeakClient("85.236.107.21");
var database;
var sendCommand = function(command, args, cb) {
	cl.send(command, args, function(err, response) {
		if (err) {
			console.log("err:", command, err);
		}
		if (response && cb) {
			cb(response);
		}

	});

}

var info = function() {
	if (debug) {
		console.log(cl);
	}

	// connect to server
	cl.send("use", {
		port : 11317
	}, function(err, response) {
		if (debug) {
			console.log("err:", err);
			console.log(util.inspect(response));
		}
		sendCommand("clientlist", {}, function(response) {
			var datevalue = new Date();
			if (debug) {
				console.log("time is: " + datevalue);
			}
			for (var i = 0; i < response.length; i++) {
				var clientId = response[i].client_database_id;
				var nickname = response[i].client_nickname;
				
				database.addRow(clientId, nickname, datevalue);
				sendCommand("clientinfo", {
					clid : response[i].clid
				}, function(clientinfo) {
					var os=clientinfo.client_platform;
					var country=clientinfo.client_country;
					var clientversion=clientinfo.client_version;
					var totalconnections=clientinfo.client_totalconnections;
					var clientdatabaseid=clientinfo.client_database_id;
					sendCommand("servergroupsbyclientid",{cldbid : clientinfo.client_database_id}, function(servergroups){
						var channelrank=servergroups.name;
						database.updateUserData(clientinfo.client_nickname,clientdatabaseid,os,country,clientversion,totalconnections,channelrank);
					});
							
							
							
					
				})
			}
		});


	});
	cl.send("quit", {}, function(err, response) {
		
	});

}

module.exports = {
	setdb : function(db) {
		database = db;
		//DISABLE THIS TO GET THE SERVER WORKING ( SERVER MOVED )
		//setInterval(info, 300000); // 5 min 300 000
	},
	scan : function(){
		//info();
	}
}