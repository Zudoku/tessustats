var express = require('express');
var app = express();
app.use("/app/", express.static(__dirname + '/app'));
app.use("/intopark/", express.static(__dirname + '/intopark'));
app.get('/', function(req, res){
	res.redirect('/intopark/');
});

app.listen(3700);
