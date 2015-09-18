var database=require('../server/database');
var tsparser=require('../server/tsparser');

tsparser.setdb(database);
tsparser.scan();
