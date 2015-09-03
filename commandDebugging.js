/**
 * Created by arnold on 19.5.2015.
 */





var config = require('./config');


var TeamSpeakClient = require("node-teamspeak"),
    util = require("util");

var cl = new TeamSpeakClient(config.TS_IP);
cl.send("login", {client_login_name: config.SERVERQUERY_LOGIN_NAME, client_login_password: config.SERVERQUERY_LOGIN_PASSWORD}, function(err, response, rawResponse){
    console.log(util.inspect(rawResponse));
    cl.send("use", { sid: 1}, function(err, response, rawResponse){
        cl.send("sendtextmessage",{targetmode : 1,target : 45, msg: "Hello from serverquery!"}, function(err, response, rawResponse){
            console.log(util.inspect(response));
        });
        cl.send("clientlist",{}, function(err, response, rawResponse){
            console.log(util.inspect(response));
        });
    });
});
