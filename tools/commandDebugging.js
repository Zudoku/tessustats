/**
 * Created by arnold on 19.5.2015.
 */





var config = require('../server/config');


var statistics = require('../server/statistics');
statistics.calculateStatisticsData();


/*
var TeamSpeakClient = require("node-teamspeak"),
    util = require("util");

console.log(util.inspect(cl));

var cl = new TeamSpeakClient(config.TS_IP);
cl.send("login", {client_login_name: config.botlogin, client_login_password: config.botpass}, function(err, response, rawResponse){
    console.log(util.inspect(rawResponse));
    cl.send("use", { sid: 1}, function(err, response, rawResponse){
        

        cl.send("clientupdate",{client_nickname : "HerGGuBot (BOT)"}, function(err, response, rawResponse){
            console.log(util.inspect(response));
            
            cl.send("clientlist",{}, function(err, response, rawResponse){
            	console.log(util.inspect(response));
        	});
        });
    });
});

*/
