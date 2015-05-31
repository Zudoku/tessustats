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

var TIME_OF_QUERY = '';


var sendCommand = function(command, args, cb) {
	console.log('Sending command: ',command,args);
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
		
		console.log(response.length +" clients to scan!");
		setTimeout(handleClientList,TIME_BETWEEN_QUERIES,response,0,function(){
			console.log("Client scan finished!");
			callback();
		});
	});
};

var handleClientList = function(clientlist,index,callback){
	if(index == clientlist.length){
		callback();
		return;
	}
	var clientObject = clientlist[index];
	var clientType = clientObject.client_type;
	//Do not log serverquery clients
	if(clientType == 1){
		console.log("Skipping serverquery user");
		setTimeout(handleClientList,TIME_BETWEEN_QUERIES,clientlist,++index,callback);
		return;
	}
	var databaseidValue = clientObject.client_database_id; //BOTH
	var nicknameValue = clientObject.client_nickname; //BOTH

	var clidValue = clientObject.clid; // userdata


	var userObject = {
		nickname : nicknameValue,
		clid : clidValue,
		os : '',
		country : '',
		clientversion : '',
		totalconnections : '',
		databaseid : databaseidValue,
		rank : '',
		lastconnected : '',
		bytesuploadedmonth: '',
		bytesdownloadedmonth: '',
		bytesuploadedtotal: '',
		bytesdownloadedtotal: '',
		talkpower : '',
		badges : ''

	};

	var onlineRecordObject = {
		databaseid : databaseidValue,
		nickname : nicknameValue,
		date : TIME_OF_QUERY,
		inputmuted : '',
		outputmuted : '',
		channel : ''
	};

	setTimeout(clientInfo,TIME_BETWEEN_QUERIES,userObject,onlineRecordObject,function(){
		setTimeout(handleClientList,TIME_BETWEEN_QUERIES,clientlist,++index,callback);
	});


};
var clientInfo = function(userObject,onlineRecordObject,callback){
	sendCommand("clientinfo", {clid: userObject.clid},function(response,err){
		if(err){
			console.log(util.inspect(err));
			setTimeout(callback,TIME_BETWEEN_QUERIES);
			return;
		}
		//Save the onlinerecord to database
		onlineRecordObject.inputmuted = (response.client_input_muted === 1)? true : false;
		onlineRecordObject.outputmuted = (response.client_output_muted === 1)? true : false;
		onlineRecordObject.channel = 'unknown';

		database.addOnlineRecord(onlineRecordObject);

		userObject.os=response.client_platform;
		userObject.country=response.client_country;
		userObject.clientversion=response.client_version;
		userObject.totalconnections=response.client_totalconnections;
		userObject.lastconnected = response.client_lastconnected;
		userObject.bytesuploadedmonth = response.client_month_bytes_uploaded;
		userObject.bytesdownloadedmonth = response.client_month_bytes_downloaded;
		userObject.bytesuploadedtotal = response.client_total_bytes_uploaded;
		userObject.bytesdownloadedtotal = response.client_total_bytes_downloaded;
		userObject.talkpower = response.client_talk_power;
		userObject.badges = response.client_badges;


		setTimeout(serverGroupByClientID,TIME_BETWEEN_QUERIES,userObject,callback);


	});
};
var serverGroupByClientID = function(userObject,callback){
	sendCommand("servergroupsbyclientid",{cldbid : userObject.databaseid}, function(response,err){
		if(err){
			console.log(util.inspect(err));
			setTimeout(callback,TIME_BETWEEN_QUERIES);
			return;
		}
		userObject.rank = response.name

		database.updateUserData(userObject);
		setTimeout(callback,TIME_BETWEEN_QUERIES);
	});
};
var scanServer = function(callback){
	sendCommand("serverinfo", {}, function(response,err) {
		if(err){
			console.log(util.inspect(err));
			callback();
			return;
		}
		var serverObject = {
				name : response.virtualserver_name,
				welcomemessage : response.virtualserver_welcomemessage,
				platform : response.virtualserver_platform,
				version : response.virtualserver_version,
				ping : response.virtualserver_total_ping,
				packetloss : response.virtualserver_total_packetloss_total,
				maxclients: response.virtualserver_maxclients,
				uptime : response.virtualserver_uptime,
		};
		database.insertServerData(serverObject);
		console.log('Serverdata scan finished!');
		callback();
		
	});
	
};

var scanChannels = function(){
	
};
var logScan = function(success){
	console.log('Logging scan!');
	
	var scanObject = {
			date : TIME_OF_QUERY,
			success : (success === true)? 'Online' : 'Offline',
	};
	
	database.logScan(scanObject);
}
var doScan = function(){
	scanClients(function(){
		scanServer(function(){
			logScan(true);
		});
	});
	
};
var loginToServerQuery = function(callback) {
	var loginArgs = {
		client_login_name : SERVERQUERY_LOGIN_NAME,
		client_login_password : SERVERQUERY_LOGIN_PASSWORD
	};
	TIME_OF_QUERY = new Date();
	sendCommand("login", loginArgs,function(response,err){
		if(err){
			console.log(util.inspect(err));
			logScan(false);
			return;
		}
		
		var useArgs = {
			sid : VIRTUAL_SERVER_ID
		}
		sendCommand("use",useArgs, function(response,err){
			if(err){
				console.log(util.inspect(err));
				logscan(false);
				return;
			}
			callback();


		});
	});
}




module.exports = {
	setdb : function(db) {
		database = db;
	},
	scan : function(){
		loginToServerQuery(doScan);

	},
	keepScanning : function(time){
		setInterval(loginToServerQuery, time,doScan);
	}
}