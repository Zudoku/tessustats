var express = require('express');
var app = express();

app.use("/intopark/", express.static(__dirname + '/intopark'));

app.listen(3700);

/*
var database=require('./database.js');
var tsparser=require('./tsparser.js');

tsparser.setdb(database);
tsparser.scan();
*/