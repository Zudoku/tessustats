# TessuStats #

Version 2.0.3



### What is this repository for? ###


### How do I get set up? ###

Example config.js
```
#!Shell
var config = {};

config.webserver_port = 3700;
config.webserver_bind = '127.0.0.1';
//SERVERQUERY / TEAMSPEAK PARSING
config.timeout_between_scans = 300000; //ms
config.serverquery_username = "ExampleUsername";
config.serverquery_password = "ExamplePassword"; 
config.virtual_server_id = 1;
config.ts_ip = "ExampleTSIP";
config.time_between_queries = 1000; //milliseconds
//DATABASE
config.database_path = 'server/db';

config.mode = "";

module.exports = config;

```


### Contribution guidelines ###

### License ###

Check [LICENSE](https://bitbucket.org/Arap/tessustat/src/171e388e1d49622d3968b8ddc4bfede3a502c65a/LICENSE.txt?fileviewer=file-view-default) file