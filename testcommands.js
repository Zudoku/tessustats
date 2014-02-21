var database=require('./database.js');
var tsparser=require('./tsparser.js');

tsparser.setdb(database);
tsparser.scan();