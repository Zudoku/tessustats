/*
 * THIS WILL HELP YOU UNDERSTAND http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf
 */


var TeamSpeakClient = require("node-teamspeak"), util = require("util");

var cl = new TeamSpeakClient("178.62.185.179");

var SERVERQUERY_LOGIN_NAME  ="Rivenation";//client_login_name
var SERVERQUERY_LOGIN_PASSWORD = "BUrZfIBV"; //client_login_password

var VIRTUAL_SERVER_ID = 1;

var TIME_BETWEEN_QUERIES = 1000;

var database;


var sendCommand = function(command, args, cb) {
	console.log(command,args);
	cl.send(command, args, function(err, response, rawResponse) {
		if (err) {
			console.log("err:", command, err);
		}
		if(cb){
			cb(response,err);
		}else{
			console.log("NO CALLBACK TO CALL")
		}

	});

};

var scanClients = function(callback){
	sendCommand("clientlist", {}, function(response,err) {
		var datevalue = new Date();
		console.log(util.inspect(response));
		setTimeout(handleClientList,TIME_BETWEEN_QUERIES,response,datevalue,0,function(){
			console.log("Client scan finished!");
			callback();
		});
	});
};
var handleClientList = function(clientlist,dateValue,index,callback){
	if(index == clientlist.length){
		callback();
		return;
	}
	var clientObject = clientlist[index];
	var databaseidValue = clientObject.client_database_id;
	var nicknameValue = clientObject.client_nickname;
	var clidValue = clientObject.clid;
	var userObject = {
		nickname : nicknameValue,
		clid : clidValue,
		os : '',
		country : '',
		clientversion : '',
		totalconnections : '',
		clientdatabaseid : databaseidValue,
		rank : ''
	};

	database.addRow(databaseidValue, nicknameValue, dateValue);

	setTimeout(clientInfo,TIME_BETWEEN_QUERIES,userObject,function(){
		setTimeout(handleClientList,TIME_BETWEEN_QUERIES,clientlist,dateValue,++index,callback);
	});


};
var clientInfo = function(userObject,callback){
	sendCommand("clientinfo", {clid: userObject.clid},function(response,err){
		if(err){
			console.log(util.inspect(err));
		}
		userObject.os=response.client_platform;
		userObject.country=response.client_country;
		userObject.clientversion=response.client_version;
		userObject.totalconnections=response.client_totalconnections;

		setTimeout(serverGroupByClientID,TIME_BETWEEN_QUERIES,userObject,callback);


	});
};
var serverGroupByClientID = function(userObject,callback){
	sendCommand("servergroupsbyclientid",{cldbid : userObject.clientdatabaseid}, function(response,err){
		if(err){
			console.log(util.inspect(err));
		}
		var channelrank=response.name;
		userObject.rank = channelrank;
		database.updateUserData(userObject.nickname,userObject.clientdatabaseid,userObject.os,userObject.country,
			userObject.clientversion,userObject.totalconnections,userObject.channelrank);
		setTimeout(callback,TIME_BETWEEN_QUERIES);
	});
};


var doScan = function(){
	scanClients(function(){
		console.log("Scan complete!");
	});
};
var loginToServerQuery = function(callback) {
	var loginArgs = {
		client_login_name : SERVERQUERY_LOGIN_NAME,
		client_login_password : SERVERQUERY_LOGIN_PASSWORD
	};
	sendCommand("login", loginArgs,function(response,err){
		if(err){
			console.log(util.inspect(err));
		}

		var useArgs = {
			sid : VIRTUAL_SERVER_ID
		}
		sendCommand("use",useArgs, function(response,err){
			if(err){
				console.log(util.inspect(err));
			}
			callback();


		});
	});
}




module.exports = {
	setdb : function(db) {
		database = db;
		//DISABLE THIS TO GET THE SERVER WORKING ( SERVER MOVED )
		//setInterval(info, 300000); // 5 min 300 000
	},
	scan : function(){
		loginToServerQuery(doScan);

	}
}