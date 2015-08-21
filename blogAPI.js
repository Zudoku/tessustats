var DATABASE_PATH = 'blogdatabase';

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(DATABASE_PATH);
var util = require("util");

function ISODateString(d) {
	function pad(n) {
		return n < 10 ? '0' + n : n
	}
	return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-'
			+ pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':'
			+ pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
}

module.exports = {
		getArticle : function(res,id){
			var result = [];
			var print = function() {
				res.send(result[0]);
			};
			db.each("SELECT * from articles where id=?;",id,function(err,row){
				result.push(row);
			},print);
		},
		getArticleList : function(res){
			var result = [];
			var print = function() {
				res.send(result);
			};
			db.each("SELECT timestamp,heading,id,tags from articles;",function(err,row){
				result.push(row);
			},print);
		},
		addArticle : function(articleObject){
			db.run("INSERT INTO articles VALUES (?,?,?,?,?)",articleObject.timestamp,
					articleObject.heading,articleObject.article,articleObject.id,articleObject.tags);
		}

}