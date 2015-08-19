/**
 * Created by arnold on 19.5.2015.
 */








var TeamSpeakClient = require("node-teamspeak"),
    util = require("util");

var cl = new TeamSpeakClient("178.62.185.179");
cl.send("login", {client_login_name: "Rivenation", client_login_password: "BUrZfIBV"}, function(err, response, rawResponse){
    console.log(util.inspect(rawResponse));
    cl.send("use", { sid: 1}, function(err, response, rawResponse){
        cl.send("channelinfo",{cid : 744}, function(err, response, rawResponse){
            console.log(util.inspect(response));
        });
    });
});
