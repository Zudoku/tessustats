/**
 * Created by arnold on 19.5.2015.
 */





var config = require('./config');


var TeamSpeakClient = require("node-teamspeak"),
    util = require("util");


var cl = new TeamSpeakClient(config.TS_IP);
cl.send("login", {client_login_name: config.botlogin, client_login_password: config.botpass}, function(err, response, rawResponse){
    console.log(util.inspect(rawResponse));
    cl.send("use", { sid: 1}, function(err, response, rawResponse){
        

        cl.send("clientupdate",{client_nickname : "HerGGuBot (BOT)"}, function(err, response, rawResponse){
            console.log(util.inspect(response));
            cl.send("sendtextmessage",{targetmode : 1,target : 20, msg: "Hello! Would you like to subscribe to catfacts ???"}, function(err, response, rawResponse){
            console.log(util.inspect(response));
        });
            cl.send("clientlist",{}, function(err, response, rawResponse){
            	console.log(util.inspect(response));
        	});
        });
    });
});
