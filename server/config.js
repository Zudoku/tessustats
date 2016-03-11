var config = {};

config.webserver_port = 3700;
config.webserver_bind = '0.0.0.0';

config.timeout_between_scans = 300000; //ms
config.serverquery_username = "Rivenation";
config.serverquery_password = "txYWcuUd"; 
config.virtual_server_id = 1;
config.ts_ip = "loungestats.com";
config.time_between_queries = 1000; //milliseconds

config.database_path = 'server/db';

config.mode = "";
config.debug_network = false;

module.exports = config;

