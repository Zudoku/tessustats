var DATABASE_PATH = 'db';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_PATH);

//http://i.imgur.com/PHlR21R.png

/*
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
	addOnlineRecord : function(onlineRecordObject) {
		var formatDate = ISODateString(onlineRecordObject.date);

		console.log(onlineRecordObject.databaseid, onlineRecordObject.nickname, "Added to database");
		db.run('INSERT INTO online (databaseid,nickname,date,inputmuted,outputmuted,channel) VALUES (?,?,?,?,?,?)',
			onlineRecordObject.databaseid, onlineRecordObject.nickname, formatDate,
			onlineRecordObject.inputmuted,onlineRecordObject.outputmuted,onlineRecordObject.channel);

	},
	close : function() {
		db.close();
	},
	getActivityChartData : function(res) {
		var arr = [];
		var mus = ['Arnold','Rivenation','Masa','Antti'];
		var line=("date\t" + mus[0] + '\t' + mus[1] + '\t' + mus[2] + '\t'
				+ mus[3] + '\t' + mus[4]+'\n');
		var handledDate = null;
		var rowString;
		var x = 0;
		var print = function() {
			
			for (var i = 0; i < arr.length; i++) {
				row = arr[i];
				line = line + row.date + "\t";
				for (var j = 0; j < mus.length; j++) {
					line += ((row[mus[j]]/(24*12))*100| 0) + "\t";
				}
				line += "\n";
			}

			res.send(line);
		};
		var r;
		db.each(
			"SELECT nickname, COUNT(*) as count,date(date)as date FROM online WHERE date>date('now','-7 days') GROUP BY nickname,date(date) ORDER BY date,nickname ASC;",
			function (err, row) {
				if (handledDate !== row.date) {
					handledDate = row.date;
					r = {};
					r.date = row.date.replace(/-/g, '');
					arr.push(r);
				}
				r[row.nickname] = row.count / 1.44;
				console.log(r);

			}, print);
	},
	selectAll : function(res) {
		var arr = [];
		var print = function() {
			res.send(arr);
		};

		db.each("SELECT * FROM online", function(err, row) {
			arr.push(row);
		}, print);

	},
	allUsersData:function(res){
		var arr = [];
		var print = function() {
			res.send(arr);
		};

		db.each("SELECT nickname,COUNT(*) as times,databaseid FROM online GROUP BY nickname ORDER BY times DESC;", function(err, row) {
			arr.push(row);
		}, print);
	},
	allUsersID:function(){
		var arr = [];
		var print = function() {
			console.log(arr);
		};
		db.each("SELECT nickname,databaseid FROM online GROUP BY clientid;", function(err, row) {
			arr.push(row);
		},print);
	},
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
		db.each("SELECT * FROM userdata WHERE databaseid = ? ",[databaseid], function(err, row) {
			arr.push(row);
		},print);
	},
	updateUserData: function(userObject){
		//nickname,clientdatabaseid,os,country,clientversion,totalconnections,channelrank
		console.log('Handling client ',userObject.nickname);

		db.serialize(function() {
			db.get("SELECT * FROM userdata WHERE databaseid = ?;",userObject.databaseid,function(err,row){
				if(row===undefined){
					console.log('Found new user!');
					db.run("INSERT INTO userdata (databaseid,nickname,os,country,clientversion,totalconnections," +
						"rank,lastconnected,bytesuploadedmonth,bytesdownloadedmonth,bytesuploadedtotal,bytesdownloadedtotal,talkpower,badges)" +
						" VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
						userObject.databaseid,userObject.nickname,userObject.os,userObject.country,userObject.clientversion,userObject.totalconnections,
						userObject.rank,userObject.lastconnected,userObject.bytesuploadedmonth,userObject.bytesdownloadedmonth,userObject.bytesuploadedtotal,
						userObject.bytesdownloadedtotal,userObject.talkpower,userObject.badges);
				}else{
					console.log('Updating existing user!');
					db.run("UPDATE userdata SET nickname = ?,os = ?,country = ?,clientversion = ?,totalconnections = ?,rank = ?,lastconnected = ?," +
						"bytesuploadedmonth = ?,bytesdownloadedmonth = ?,bytesuploadedtotal = ?,bytesdownloadedtotal,talkpower = ?,badges = ? WHERE databaseid = ?",
						userObject.nickname,userObject.os,userObject.country,userObject.clientversion,userObject.totalconnections,
						userObject.rank,userObject.lastconnected,userObject.bytesuploadedmonth,userObject.bytesdownloadedmonth,userObject.bytesuploadedtotal,
						userObject.bytesdownloadedtotal,userObject.talkpower,userObject.badges,userObject.databaseid);
				}
			});
		});

		
	}

}

