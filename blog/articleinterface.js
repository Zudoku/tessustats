var express = require('express');
var config = require('../server/config');
var blogAPI = require('../blog/blogAPI');
var app = express();

app.use(express.bodyParser());

app.post('/upload', function(req, res) {
	console.log(req.body);
	var object = req.body;
	object.timestamp = new Date();
    blogAPI.addArticle(object);

    res.send(200);
});
app.get('/',function(req, res) {
	res.type('html');
	res.sendfile('blog/articleform.html');
});

app.listen(config.webserver_port,config.webserver_bind);
