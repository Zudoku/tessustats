DROP TABLE online;
DROP TABLE userdata;
DROP TABLE serverdata;
DROP TABLE scans;
DROP TABLE lastscan;
DROP TABLE channels;
DROP TABLE activechannels;
DROP TABLE statistics_OS;
DROP TABLE forumPosts;
DROP TABLE forumPostsComments;
DROP TABLE forumAccounts;
DROP TABLE forumRegisters;
DROP TABLE forumAuthentication;

CREATE TABLE online
(
databaseid INTEGER,
nickname var char(20),
date datetime,
inputmuted BOOLEAN,
outputmuted BOOLEAN,
channel INTEGER
);

CREATE TABLE userdata
(
databaseid INTEGER,
nickname var char(20),
os TEXT,
country TEXT,
clientversion TEXT,
totalconnections INTEGER,
rank TEXT,
lastconnected INTEGER,
bytesuploadedmonth INTEGER,
bytesdownloadedmonth INTEGER,
bytesuploadedtotal INTEGER,
bytesdownloadedtotal INTEGER,
talkpower INTEGER,
badges TEXT,
uniqueID TEXT,
description TEXT,
verifiedForumAccount BOOLEAN
);

CREATE TABLE serverdata
(
name TEXT,
welcomemessage TEXT,
platform TEXT,
version TEXT,
ping INTEGER,
packetloss REAL,
maxclients INTEGER,
uptime INTEGER,
id INTEGER
);

INSERT INTO serverdata 
(name,welcomemessage,platform,version,ping,packetloss,maxclients,uptime,id)
values
('tempname','welcome','platform xyz','version xyz',100,0.55,32,10000,1);

CREATE TABLE lastscan
(
date datetime,
success TEXT,
id INTEGER
);

INSERT INTO lastscan
(date,success,id)
values
('1900-01-01 11:11:11','Online',1);

INSERT INTO lastscan
(date,success,id)
values
('1900-01-01 11:11:11','Online',2);

CREATE TABLE scans
(
date datetime
);

CREATE TABLE channels
(
cid INTEGER,
pid INTEGER,
name TEXT,
topic TEXT,
description TEXT,
passwordprotected INTEGER,
orderT INTEGER,
type TEXT,
encryptedvoice INTEGER,
secondsempty INTEGER
);

CREATE TABLE activechannels
(
cid INTEGER
);

CREATE TABLE statistics_OS
(
name TEXT,
amount INTEGER
);

CREATE TABLE forumPosts
(
creator INTEGER,
ID INTEGER,
created datetime,
updated datetime,
comments INTEGER,
category TEXT,
title TEXT,
content TEXT
);

CREATE TABLE forumPostsComments
(
commenter INTEGER,
forumPost INTEGER,
comment TEXT,
postTime datetime
);

CREATE TABLE forumUtil
(
currentID INTEGER
);

INSERT INTO forumUtil (currentID) values (1);

CREATE TABLE forumRegisters
(
databaseID INTEGER,
uniqueID TEXT,
created datetime,
authguid TEXT
);

CREATE TABLE forumAuthentication
(
databaseID INTEGER,
uniqueID TEXT,
authguid TEXT,
created datetime,
lastUsed datetime
);