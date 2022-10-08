用户表：
create table user (
     id int unsigned auto_increment,
     username varchar(100),
     password varchar(100), 
     name varchar(100),
     avatar varchar(100),
     phone varchar(20),
     status TINYINT default 1,
     roles varchar(100),
     primary key(id)
);

用户与好友中间表：
create table user_friend (
     id int unsigned auto_increment,
     userid int unsigned,
     friendid int unsigned,
     status int default 0,
     remark varchar(100),
     latestid int unsigned,
     primary key(id)
);
私聊消息表：
create table friend_message (
     id int unsigned auto_increment,
     userid int unsigned,
     friendid int unsigned,
     content varchar(2000),
     time int unsigned,
     status TINYINT default 1,
     type TINYINT default 1,
     address varchar(200),
     isLatest tinyint default 0,
     primary key(id)
);

用户与群中间表：
create table user_group (
     id int unsigned auto_increment,
     userid int unsigned,
     groupid int unsigned,
     status TINYINT default 1,
     latestid int unsigned,
     primary key(id)
);
群表：
create table groupchat (
     id int unsigned auto_increment,
     userid int unsigned,
     groupid int unsigned,
     groupname varchar(255),
     notice text,
     createTime int unsigned,
     status TINYINT default 1,
     latestid int unsigned,
     primary key(id)
);
群聊消息表：
create table group_message (
     id int unsigned auto_increment,
     userid int unsigned,
     groupid int unsigned,
     content varchar(2000),
     time int unsigned,
     status TINYINT default 1,
     type TINYINT default 1,
     address varchar(200),
     primary key(id)
);
