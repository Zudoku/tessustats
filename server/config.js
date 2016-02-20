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
