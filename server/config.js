var config = {};
//WEB APP
config.webserver_port = 3700;
config.webserver_bind = '127.0.0.1';
//SERVERQUERY / TEAMSPEAK PARSING
config.TIMEOUT_BETWEEN_SCANS = 300000; //ms
config.SERVERQUERY_LOGIN_NAME  = "";//client_login_name
config.SERVERQUERY_LOGIN_PASSWORD = ""; //client_login_password
config.VIRTUAL_SERVER_ID = 1;
config.TS_IP = "";
config.TIME_BETWEEN_QUERIES = 1000; //milliseconds
//DATABASE
config.DATABASE_PATH = 'server/db';

config.MODE = "";


module.exports = config;