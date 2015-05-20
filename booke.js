/**
 * Created by arnold on 19.5.2015.
 */
    /*
var TeamSpeakClient = require("node-teamspeak"),
    util = require("util");

var cl = new TeamSpeakClient("178.62.185.179");
cl.send("login", {client_login_name: "Rivenation", client_login_password: "BUrZfIBV"}, function(err, response, rawResponse){
    console.log(util.inspect(rawResponse));
    cl.send("use", { sid: 1}, function(err, response, rawResponse){
        cl.send("clientlist", function(err, response, rawResponse){
            console.log(util.inspect(response));
        });
    });
});*/


var asd = function(user,callback){
    console.log("asd");
    setTimeout(fgh,2000,user,callback);
};
var fgh = function(user,callback){
    console.log("fgh" + user);
    callback();
};
var complete = function(){
    console.log("COMPLETION")
}

setTimeout(asd,2000,"kalle",complete);