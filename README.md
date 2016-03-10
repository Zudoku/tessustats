# TessuStats #

Version 2.0.4

http://tessustats.ovh/

TessuStats is a website / webapp that collects data from the HerGGu Teamspeak server and displays different statistics, graphs and information about how the server is operating. TessuStats is completely non-profit free website and is developed and maintained just for practice, portfolio and own fun.

### How do I get set up? ###

#### config ####

Example config.js
```
#!Shell
var config = {};

config.webserver_port = 3700;
config.webserver_bind = '127.0.0.1';

config.timeout_between_scans = 300000; //ms
config.serverquery_username = "ExampleUsername";
config.serverquery_password = "ExamplePassword"; 
config.virtual_server_id = 1;
config.ts_ip = "ExampleTSIP";
config.time_between_queries = 1000; //milliseconds

config.database_path = 'server/db';

config.mode = "";

module.exports = config;

```
#### Installing with Docker####

```
#!Shell

docker build  -t herggu/tessustats . 
```

#### Installing without Docker ####

```
#!Shell
npm install
node tools/server.js

```

### License ###

Check [LICENSE](https://bitbucket.org/Arap/tessustats/src/1f4447ff29808e998383f84cc9d7d9ebc73b0b33/LICENSE.txt?fileviewer=file-view-default) file