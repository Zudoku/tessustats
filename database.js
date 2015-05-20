var DATABASE_PATH = 'db';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_PATH);

//http://i.imgur.com/PHlR21R.png

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
	addRow : function(clientidvalue, nicknamevalue, datevalue) {
		var formatDate = ISODateString(datevalue);
		// dont log ourselves ;)
		if (nicknamevalue.indexOf("Unknown from") != -1) {
			return;
		}
		console.log(clientidvalue, nicknamevalue, datevalue, 'added to db');
		db.run('INSERT INTO online (clientid,nickname,date) VALUES (?,?,?)',
				clientidvalue, nicknamevalue, formatDate);

	},
	close : function() {
		db.close();
	},
	chartData : function(res) {
		var arr = [];
		var mus = ['Aeas','Arnold','GeKKo','Masa','Purkkiv'];
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
		}
		var r;
		db
				.each(
						"SELECT nickname, COUNT(*) as count,date(date)as date FROM online WHERE date>date('now','-7 days') GROUP BY nickname,date(date) ORDER BY date,nickname ASC;",
						function(err, row) {
							if (handledDate !== row.date) {
								handledDate = row.date;
								r = {};
								r.date = row.date.replace(/-/g,'');
								arr.push(r);
							}
							r[row.nickname] = row.count/1.44;
							console.log(r);

						}, print);
	},
	selectAll : function(res) {
		var arr = [];
		var print = function() {
			res.send(arr);
		}

		db.each("SELECT * FROM online", function(err, row) {
			arr.push(row);
		}, print);

	},
	allUsersData:function(res){
		var arr = [];
		var print = function() {
			res.send(arr);
		}

		db.each("SELECT nickname,COUNT(*) as times,clientid FROM online GROUP BY nickname ORDER BY times DESC;", function(err, row) {
			arr.push(row);
		}, print);
	},
	allUsersID:function(){
		var arr = [];
		var print = function() {
			console.log(arr);
		}
		db.each("SELECT nickname,clientid FROM online GROUP BY clientid;", function(err, row) {
			arr.push(row);
		},print);
	},
	getUserData:function(res,databaseid){
		var arr = [];
		var print = function() {
			res.send(arr[0]);
		}
		db.each("SELECT * FROM userdata WHERE databaseid = ? ",[databaseid], function(err, row) {
			arr.push(row);
			console.log("one row in the bank");
		},print);
	},
	updateUserData: function(nickname,clientdatabaseid,os,country,clientversion,totalconnections,channelrank){
		console.log('Handling client ',nickname);

		db.serialize(function() {
			db.get("SELECT * FROM userdata WHERE databaseid = ?;",clientdatabaseid,function(err,row){
				if(row===undefined){
					console.log('Client doesn\'t exist!');
					db.run("INSERT INTO userdata (databaseid,nickname,os,country,clientversion,totalconnections,channelrank) VALUES (?,?,?,?,?,?,?)",
						clientdatabaseid,nickname,os,country,clientversion,totalconnections,channelrank);
				}else{
					console.log('Updating existing client!');
					db.run("UPDATE userdata SET nickname = ?,os = ?,country = ?,clientversion = ?,totalconnections = ?,channelrank = ? WHERE databaseid = ?",
							nickname,os,country,clientversion,totalconnections,channelrank,clientdatabaseid);
				}
			});
		});

		
	}

}

