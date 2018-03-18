/*
记录SQL变化的文件，我们大多的项目都命名为：change.sql

文件基本的组成部分：SQL的版本，SQL的创建人，SQL的生成时间，SQL的内容

文件格式：

SQL版本格式：
-- 空格 v1.0.0

"--" : 注释符
"空格" : 你没理解错，就是空格，非字符啊，表示"--"与"v"之间必须有"空格"
"v" : version缩写
"1.0.0" : 版本号
两个版本之间包含多条SQL, 这个四个元素，必须写在一行

使用场景: 
-- v1.0.0

update ...
alert ...
insert into ...

-- v1.0.1

v1.0.0与v1.0.1之间包含多条SQL


每条SQL的格式：
-- 空格 Author 空格 Date(yyyy-MM-dd)
SQL content

"--" : 注释符
"Author" : SQL的创建人
"Date" : SQL的生成时间,格式为yyyy-MM-dd
"SQL content": SQL内容
"空格" : 你没理解错，就是空格，非字符啊

使用场景: 
-- Alex 2017-03-13
update config set version = 'v1.0.26';

*/

update config set version = 'v0.0.1';

-- terry 2016-4-24

alter table datatype add position_exp varchar(255) NOT NULL default '';


-- kevin 2016-4-26

alter table `custom/Column` rename `custom_column`;

alter table `custom/Table` rename `custom_table`;

-- Kevin 2016-05-05

alter table popup modify props text default null;

alter table datatype add `model2d` varchar(255) DEFAULT NULL;

alter table datatype add `model2d_parameters` text;

-- Kevin 2016-05-23

alter table template_data add `group_id` varchar(50) default null;

-- Kevin 2016-05-25

alter table data add `position2d`  varchar(255) DEFAULT NULL;

-- Kevin 2016-06-02

alter table alarm_type change column alarm_name `name` varchar(255) default null;

alter table alarm_type change column alarm_default_level `level` varchar(255) default null;

-- Kevin 2016-06-14

alter table collector add `location` varchar(255) default '';

-- alex 2016-06-14
update datatype set model = REPLACE(model, '"','');
update datatype set simple_model = REPLACE(simple_model, '"','');
update datatype set model2d = REPLACE(model2d, '"','');


-- haley

update datatype set model_parameters = '[{"id":"itv.wall1","data":[[-2354,1711],[2357,1711],[2357,-1716],[-2354,-1716]],"closed":true,"showFloor":true,"client":{"label":"itv.wall1"},"wallHeight":300},{"id":"itv.glassWall1","wallHeight":300,"data":[[-2354,112],[1089,112]],"client":{"label":"itv.glassWall1"}},{"id":"itv.glassWall2","wallHeight":300,"data":[[1089,1147],[1089,-1712]],"client":{"label":"itv.glassWall2"},"children":[{"id":"twaver.idc.door","frame":false,"width":197.31027814752892,"depth":26,"position":[1089.186601765372,10,-135.65320755543073],"rotation":[0,1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.44863700858881805}}]},{"id":"itv.glassWall2","wallHeight":300,"data":[[-2354,1147],[1089,1147]],"client":{"label":"twaver.idc.innerWall"},"children":[{"id":"twaver.idc.door","width":197.31027814752906,"depth":26,"position":[695.4177993383026,10,1146.995253880502],"client":{"edgeIndex":0,"offset":0.8856862617886444}}]},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[-1418,1711],[-1418,1147]],"client":{"label":"twaver.idc.innerWall"},"children":[{"id":"twaver.idc.door","width":197.31027814752906,"depth":26,"position":[-1417.78704845336,10,1428.9313221983507],"rotation":[0,1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.5001217691518605}}]},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[1498,-1712],[1498,1711]],"client":{"label":"twaver.idc.innerWall"},"children":[{"id":"itv.door1","position":[1497.586313871876,10,321.2274743421819],"rotation":[0,-1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.5939899136261122}},{"id":"itv.door1","position":[1497.586313871876,10,852.2204233078287],"rotation":[0,-1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.7491149352345395}},{"id":"itv.door1","position":[1497.586313871876,10,-135.65320755543073],"rotation":[0,-1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.4605161532119688}},{"id":"itv.door1","position":[1497.586313871877,10,-1125.9856941575474],"rotation":[0,-1.5707963267948966,0],"client":{"edgeIndex":0,"offset":0.17119903764021402}}]},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[752,1711],[2058,1711]],"client":{"label":"twaver.idc.innerWall"},"children":[{"id":"itv.door1","position":[1274.6097635016545,10,1710.8673905161993],"client":{"edgeIndex":0,"offset":0.40016061523863283}}]},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[1498,-884],[2357,-884]],"client":{"label":"twaver.idc.innerWall"}},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[1498,586],[2357,586]],"client":{"label":"twaver.idc.innerWall"}},{"id":"twaver.idc.innerWall","wallHeight":300,"data":[[1498,112],[2357,112]],"client":{"label":"twaver.idc.innerWall"}},{"id":"itv.column2","width":66,"depth":67,"position":[1089,"floor-top",111.5],"client":{"label":"itv.column2"}},{"id":"itv.column1","width":66,"depth":67,"position":[1497,"floor-top",111.5],"client":{"label":"itv.column1"}},{"id":"itv.column1","width":66,"depth":67,"position":[1497,"floor-top",585.5],"client":{"label":"itv.column1"}},{"id":"itv.column1","width":66,"depth":67,"position":[1497,"floor-top",-884.5],"client":{"label":"itv.column1"}},{"id":"itv.column1","width":66,"depth":67,"position":[1089,"floor-top",1146.5],"client":{"label":"itv.column"}},{"id":"itv.column2","width":66,"depth":67,"position":[-1418,"floor-top",1146.5],"client":{"label":"itv.column2"}}]' where  id='floor02';
update datatype set model_parameters = '{"height":220,"depth":100,"type":"headerRack"}', model = 'itv.headerRack2' where id = 'header_rack_type_01';
update datatype set model_parameters = '{"width":60,"height":47,"depth":100,"type":"rack"}', model = 'itv.rack1' where id = 'rack_type_01';


-- Haley 2016-06-20

update datatype set model_parameters = '{"width":60,"height":47,"depth":100,"type":"rack"}', model = 'itv.rack1', simple_model='itv.simpleRack1' where id = 'rack_type_01';

-- Kevin 2016-06-23

alter table scene add network_parameters varchar(255) not null default '';
alter table scene add camera_parameters varchar(255) not null default '';

update scene set network_parameters = '{"blurScale":2,"blurGlobalAlpha":0.5,"clearColor":"#000000","clearAlpha":0,"backgroundImage":"../images/earth/sky.jpg"}' where id = 'earth';



-- alex 2016-06-14

update datatype set model = REPLACE(model, '"','');
update datatype set simple_model = REPLACE(simple_model, '"','');
update datatype set model2d = REPLACE(model2d, '"','');


-- terry 2016-6-23 category 增加system 表示是否内置的：

alter table category add `system` smallint(1) not null default 0;


-- andy 2016-06-24
alter table datatype add `system` boolean DEFAULT false;
alter table category add `system` boolean DEFAULT false;

alter table datatype modify `system` boolean DEFAULT false;
alter table category modify `system` boolean DEFAULT false;

alter table category change stop_alarm_propagation stop_alarm_propagationable boolean;


update datatype set category_id = 'dataCenter' where category_id = 'datacenter';

update scene set category_id = 'dataCenter' where category_id = 'datacenter';

update datatype set model = 'itv.rack' where model = 'itv.rack1';

update datatype set simple_model = 'itv.simpleRack' where simple_model = 'itv.simpleRack1';


-- terry 2016-6-29 增加机房或者机柜的额定功率

alter table datatype add `power_rating` DECIMAL(8,4) NOT NULL default 0.0;


update data set position = REPLACE(position, '"y":0','"y":"100"') where data_type_id ='generator_type_01';
update data set position = REPLACE(position, '"x":1800','"x":"1950"') where id like 'f2generator%';



-- Kevin 2016-07-04

alter table scene modify `scene_type` enum('','ShowChildren','ShowSelfAndChildren','ShowSelfAndDescendant','ShowSelf','ShowThird') DEFAULT 'ShowSelf';


-- haley 2016-07-20
update data set position = REPLACE(position, '"y":"100"','"y":"90"') where data_type_id='switchgear_type_01';
update data set position = REPLACE(position, '"y":"100"','"y":"90"') where data_type_id='pdc_type_01';
update data set position = REPLACE(position, '"y":"80"','"y":"53"') where data_type_id='alternator_type_01';



-- terry 2016--7-25

alter table link modify id varchar(255) NOT NULL default '';

-- andy 2016-07-26
alter table link add column `from_port_id` varchar(255) default null;
alter table link add column `to_port_id`  varchar(255) default null;
alter table link add column `description`  varchar(255) default null;

-- haley 2016-07-27
update datatype set simple_model = 'twaver.scene.datacenter' where category_id = 'datacenter';

-- andy 2016-07-28
alter table datatype add column `weight_rating`  int default null;
alter table data add column `weight`  int default null;

-- Alex 2016-07-29

update datatype set model_parameters='[{"id":"twaver.scene.skybox3"},{"id":"twaver.scene.earth"}]' where id = 'earth01';

-- haley 2016-08-03
update data set position = REPLACE(position, '"y":"30"','"y":"53"') where data_type_id='meetingChair1';


update datatype set model_parameters = '{"dcId":"dc001"}' where id = 'dc001';

-- haley 2016-08-10
insert into category value('camera','摄像头',false,now(),now(),true);
update datatype set category_id = 'camera' where id = 'camera';

-- andy 2016-08-11
alter table tool add column `type`  int default 0;

-- alex 2016-08-11
update datatype set category_id = 'alternator' where category_id = 'power';
update datatype set category_id = 'room' where category_id = 'area';
update datatype set category_id = 'doorControl' where category_id = 'door_control';

--haley 2016-08-16
update datatype set model = 'twaver.idc.bigScreen2' where model = 'twaver.meeting.pingmu';
update datatype set model = 'twaver.idc.rack2-42',simple_model = 'twaver.idc.simpleRack2-42' where id = 'rack42';
update datatype set model = 'twaver.idc.rack2-43',simple_model = 'twaver.idc.simpleRack2-43' where id = 'rack43';
update datatype set model = 'twaver.idc.rack2-44',simple_model = 'twaver.idc.simpleRack2-44' where id = 'rack44';
update datatype set model = 'twaver.idc.rack2-45',simple_model = 'twaver.idc.simpleRack2-45' where id = 'rack45';
update datatype set model = 'twaver.idc.rack2-46',simple_model = 'twaver.idc.simpleRack2-46' where id = 'rack46';
update datatype set model = 'twaver.idc.rack2-47',simple_model = 'twaver.idc.simpleRack2-47' where id = 'rack47';
update datatype set model = 'twaver.idc.rack2' where model = 'itv.rack';
update datatype set simple_model = 'twaver.idc.simpleRack2' where simple_model = 'itv.simpleRack';

update datatype set model = 'twaver.idc.headerRack1' where model = 'itv.headerRack1';
update datatype set model = 'twaver.idc.headerRack2' where model = 'itv.headerRack2';
update datatype set model = 'twaver.idc.headerRack3' where model = 'itv.headerRack3';

update datatype set model_parameters = REPLACE(model_parameters, 'itv.wall1','twaver.idc.wall5') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.innerWall1','twaver.idc.innerWall2') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.glassWall1','twaver.idc.glassWall1') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.glassWall2','twaver.idc.glassWall3') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.column1','twaver.idc.column1') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.column2','twaver.idc.column2') where category_id='floor';
update datatype set model_parameters = REPLACE(model_parameters, 'itv.door1','twaver.idc.door2') where category_id='floor';

update datatype set model = 'twaver.scene.building1' where model = 'twaver.scene.building';


update datatype set model = 'twaver.idc.bigScreen2' where model = 'twaver.meeting.pingmu';

update datatype set model = 'twaver.idc.rack3',simple_model = 'twaver.idc.simpleRack3' where model = 'longjiang.rack';
update datatype set model_parameters = REPLACE(model_parameters, 'longjiang.innerWall','twaver.idc.innerWall3') where category_id='floor';
update datatype set model = 'twaver.idc.headerRack4' where model = 'longjiang.headerRack';
update datatype set model = 'twaver.idc.airCondition3' where model = 'longjiang.airCondition';

alter table scene add show_static_info tinyint(1) not null default 1;

-- andy 2016-08-16
alter table datatype modify `model_parameters` longtext DEFAULT '';
-- 巡检变动太大,不提供更新脚本
drop table if  exists inspection; --变更为inspection_path
drop table if  exists inspection_path;
drop table if  exists inspection_point;
drop table if  exists inspection_report;
drop table if  exists `inspection-report`; -- 变更为inspection_report
drop table if  exists inspection_data;
drop table if  exists `inspection-data`; --变更为 inspection_data
drop table if  exists inspection_property;
drop table if  exists `inspection-property`; -- 变更为inspection_property

-- alex 2016-08-23
alter table data add column `name` varchar(500) not null default '';
update data set name = description where description is not null;
	
--haley 2016-08-23

insert into category value('post',true,'岗位',false,now(),now());
update datatype set category_id = 'post' where id = 'dutyPost';
update datatype set model = 'twaver.idc.post1', model_parameters = '{}' where id = 'dutyPost';

-- alex 2016-09-06
alter table data add `extend` text;

alter table channel drop `comm_id`;
alter table channel add `comm` varchar(255);
alter table channel drop `protocol_id`;
alter table channel add `protocol` varchar(255);

 -- andy 2016-08-29
 alter table datatype add sub_type varchar(255) not null default '';
 update datatype set sub_type='network' where id in ('cisco_2950','cisco_2960','cisco_3800','h3c_s1050t','h3c_s1224','h3c_s5120_series','h3c_sr8808','hw_s2700','hw_s3700');

 -- andy 2016-09-06
 alter table camera_animate_action add data_id varchar(255) not null default '';
 alter table camera_animate_action add event varchar(255) not null default '';
 update datatype set sub_type='network' where id in ('cisco_2950','cisco_2960','cisco_3800','h3c_s1050t','h3c_s1224','h3c_s5120_series','h3c_sr8808','hw_s2700','hw_s3700');

-- haley 2016-09-05 华运通不需要显示logo
update datatype set model_parameters = '{"dcId":"dc001","showLogo":false}' where id ='dc001';


-- terry 2016-09-12
-- 增加网络、物理 告警类型

set names utf8;
insert into alarm_type (id,name,description,level) values('网络告警','网络告警','网络告警',500);
insert into alarm_type (id,name,description,level) values('物理告警','物理告警','物理告警',500);

-- Kevin 2016-09-09
alter table popup add `url` varchar(255) not null default '';

-- terry 2016-09-13 增加是否预制的选项
alter table datatype add column `no_prefab`  tinyint(1) DEFAULT 0;


-- andy 2016-09-14 增加冗余字段, 方便查询
alter table inspection_data add column `inspection_report_id`  varchar(255) not null default '';
alter table inspection_data add column `inspection_path_id`  varchar(255) not null default '';

-- alex 2016-09-18

alter table datatype add column `no_virtual_other`  tinyint(1) DEFAULT 0;

-- Kevin 2016-09-26

alter table temperature_field add column `with_bg` tinyint(1) DEFAULT '0';

set names utf8;
insert into tool value('twaver.idc.watercable','新建漏水',null,4,14,now(),now());

-- andy 2016-09-28
alter table config add column `power_load_config` varchar(255) DEFAULT null;
alter table config add column `weight_load_config` varchar(255) DEFAULT null;
update config set `power_load_config` = '{"min":20,"max":80}' where `id` = 'system';
update config set `weight_load_config` = '{"min":20,"max":80}' where `id` = 'system';

-- Kevin 2016-10-11

alter table scene add default_interaction_parameters varchar(255) not null default '';

-- Kevin 2016-10-17

alter table category add visible tinyint(1) default 1;

-- kevin 2016-10-18

alter table cooling_pipeline add `option` varchar(255) not null default '';

-- V1.0.14

-- terry  2016.10.13 记得打个版本号

-- V1.0.15

-- V1.0.16

-- v1.0.17 

update config set version = 'v1.0.17';

-- terry 2016-11-14

alter table cctv modify id varchar(50) NOT NULL default '';

alter table alarm add client text;
alter table alarm add dev_ip varchar(20) NOT NULL default '';

alter table alarm_log add client text;
alter table alarm_log add dev_ip varchar(20) NOT NULL default '';

-- Kevin 2016-11-16 ,只用于贵州浪潮
-- alter table custom_column add column_group_id varchar(255) not null default '';

-- Kevin 2016-11-23 用于gzlc
--  delete from alarm_type where id = 'waterLeak';

-- Alex 2016-11-22
alter table data drop primary key;
alter table data add ii int(11) auto_increment primary key first;

-- Alex 2016-11-25
-- alter table data modify createdAt datetime not null default '1970-01-01 01:01:01';
-- alter table data modify updatedAt datetime not null default '1970-01-01 01:01:01';
-- alter table data modify createdAt datetime not null default CURRENT_TIMESTAMP;
-- alter table data modify updatedAt datetime not null default CURRENT_TIMESTAMP;

alter table data modify createdAt datetime ;
alter table data modify updatedAt datetime ;

-- Alex 2016-11-28
alter table data add UNIQUE KEY(id);

--  v1.0.18

update config set version = 'v1.0.18';

-- Alex 2016-12-1
-- alter table data drop `extend`;


alter table data add `extend` text;
-- update datatype set model_parameters = replace(model_parameters,'}',',"client":{"animation":null}}') where category_id = 'equipment' and model_parameters <> '{}';
-- update datatype set model_parameters = '{"client":{"animation":null}}' where category_id = 'equipment' and model_parameters = '{}';

-- Kevin 2016-12-07 , search_filter的存在只为了在搜索时，是否存在于过滤框中。
--            若是加到sdk中不太合理，跟sdk关联的不紧密，弄了个_userDataMap

alter table category add search_filter tinyint(1) default 1;

alter table datatype add search_filter tinyint(1) default 1;

alter table category add performance_url text ;

alter table category modify performance_url text ;

update category set performance_url = null where performance_url = '';

-- Alex 2016-12-12
update data set weight = 0 where weight is null;
alter table data modify weight int(11) not null default 0;
update datatype set weight_rating = 0 where weight_rating is null;
alter table datatype modify weight_rating int(11) not null default 0;

-- Kevin 2016-12-15

alter table category modify performance_url text ;

-- alter table data modify weight int(11) ;
-- alter table datatype modify weight_rating int(11);

-- Alex 2016-12-19
update category set stop_alarm_propagationable = 0 where stop_alarm_propagationable is null;
alter table category modify stop_alarm_propagationable tinyint(1) not null default 0;
update datatype set stop_alarm_propagationable = 0 where stop_alarm_propagationable is null;
alter table dataType modify stop_alarm_propagationable tinyint(1) not null default 0;
update datatype set batchable = 0 where batchable is null;
alter table dataType modify batchable tinyint(1) not null default 0;
update datatype set lazyable = 0 where lazyable is null;
alter table dataType modify lazyable tinyint(1) not null default 0;

-- Kevin 2016-12-22

alter table data add business_type_id varchar(255) default null;

-- Haley 2016-12-19
alter table datatype add model2d2  varchar(255) DEFAULT NULL;
alter table datatype add model2d2_parameters  longtext;
alter table template_data add side tinyint(1) default 0 after parent_data_type_id; 
alter table template_data DROP PRIMARY KEY ,ADD PRIMARY KEY ( id,parent_data_type_id,side);

-- alisa 2016-12-21
update datatype set model = 'twaver.idc.worker2' where model = 'twaver.idc.ren';
update datatype set model = 'twaver.meeting.officeTable6' where model = 'twaver.meeting.computerTable';
update datatype set model = 'twaver.meeting.cabinet5' where model = 'twaver.meeting.guizi1';
update datatype set model = 'twaver.meeting.boardroomTable6' where model = 'twaver.meeting.table1';
update datatype set model = 'twaver.meeting.monitor' where model = 'twaver.meeting.table';
update datatype set model = 'twaver.meeting.monitor2' where model = 'twaver.meeting.monitor';
update datatype set model = 'twaver.meeting.cabinet6' where model = 'twaver.meeting.wardrobe';

-- Haley 2016-12-22
update datatype set children_size = replace(children_size,'"zPadding":[-0.5,-0.5]','"zPadding":[1,1]') where category_id = 'rack';


-- v1.0.19

update config set version = 'v1.0.19';


-- Haley 2016-12-26

update datatype set model = 'twaver.idc.chuanganqi' where model = 'twaver.idc.changuanqi';
update datatype set model = 'twaver.idc.chuanganqi2' where model = 'twaver.idc.changuanqi2';
update datatype set model = 'twaver.idc.chuanganqi3' where model = 'twaver.idc.changuanqi3';
update datatype set model = 'twaver.idc.chuanganqi4' where model = 'twaver.idc.changuanqi4';

-- Kevin 2016-12-27

alter table link add from_side tinyint(1) default 0;
alter table link add to_side tinyint(1) default 0;

-- v1.0.20

update config set version = 'v1.0.20';

-- andy 2017-01-03 恢复告警的级别为名称, 而不是 value
update alarm set level = null;
update alarm_type set level = 'critical' where level='500';
update alarm_type set level = 'major' where level='400';
update alarm_type set level = 'minor' where level='300';
update alarm_type set level = 'warning' where level='200';
update alarm_type set level = 'indeterminate' where level='100';
update alarm_type set level = 'cleared' where level='0';
update alarm_type set level = 'critical' where level is null or level = '';


DROP TABLE IF EXISTS `alarm_severity`;
CREATE TABLE `alarm_severity`(`id` varchar(255) NOT NULL,  `nick_name` varchar(255) DEFAULT 'C', `display_name` varchar(255) DEFAULT '严重告警',  `value` int(11) DEFAULT '500',  `color` varchar(255) DEFAULT '#FF0000',  `description` varchar(255) DEFAULT '',  `createdAt` datetime NOT NULL,  `updatedAt` datetime NOT NULL,  PRIMARY KEY (`id`)) DEFAULT CHARSET=utf8;

INSERT INTO `alarm_severity` VALUES ('cleared','R','清除告警',0,'#00FF00','清除告警','2017-01-03 06:53:19','2017-01-03 06:53:19');
INSERT INTO `alarm_severity` VALUES ('critical','C','严重告警',500,'#FF0000','严重告警','2017-01-03 06:53:19','2017-01-03 06:53:19');
INSERT INTO `alarm_severity` VALUES ('indeterminate','I','不确定告警',100,'#C800FF','不确定告警','2017-01-03 06:53:19','2017-01-03 06:53:19');
INSERT INTO `alarm_severity` VALUES ('major','M','主要告警',400,'#FFA000','主要告警','2017-01-03 06:53:19','2017-01-03 06:53:19');
INSERT INTO `alarm_severity` VALUES ('minor','m','次要告警',300,'#FFFF00','次要告警','2017-01-03 06:53:19','2017-01-03 06:53:19');
INSERT INTO `alarm_severity` VALUES ('warning','W','警告告警',200,'#00FFFF','警告告警','2017-01-03 06:53:19','2017-01-03 06:53:19');


-- alisa 2017-1-3
 update datatype set size = '{"y":2}' where id = 'HW_CE8860-4C-EI';
 update datatype set size = '{"y":1}' where id = 'sunsea_f218d_24';
 update datatype set size = '{"y":1}' where id = 'HW_CE6851-48S6Q-HI';
 update datatype set size = '{"y":1}' where id = 'HW_S5720-56C-EI-48S-AC';
 update datatype set size = '{"y":1}' where id = 'HW_S5700-52P-LI-AC';
 update datatype set size = '{"y":5}' where id = 'HW_OptiX-PTN-1900';
 update datatype set size = '{"y":1}' where id = 'Quidway_S5700';
 update datatype set size = '{"y":1}' where id = 'HW_AR2200-S';
 update datatype set size = '{"y":1}' where id = 'cisco_3560';
 update datatype set size = '{"y":1}' where id = 'cisco_4948e';
 update datatype set size = '{"y":32}' where id = 'cisco_nexus_7000';
 update datatype set size = '{"y":1}' where id = 'cisco_weizhixinghao01';
 update datatype set size = '{"y":1}' where id = 'huawei_weizhixinghao01';
 update datatype set size = '{"y":1}' where id = 'IBM_2984_B24';

update datatype set size = '{"y":2}' where id = 'sunsea_f218d_24';
update datatype set size = '{"y":1}' where id = 'xindahuanyu_weizhixinghao01';
update datatype set size = '{"y":2}' where id = 'zhongxing_weizhixinghao01';
update datatype set size = '{"y":2}' where id = 'sunsea_weizhixinghao01';
update datatype set size = '{"y":2}' where id = 'sunsea_weizhixinghao02';
update datatype set size = '{"y":1}' where id = 'te_2960s';
update datatype set size = '{"y":1}' where id = 'resional_kvm';
update datatype set size = '{"y":2}' where id = 'juniper_ssg520m';
update datatype set size = '{"y":4}' where id = 'IBM_X3850_X6';
update datatype set size = '{"y":2}' where id = 'IBM_X3650_M5';
update datatype set size = '{"y":2}' where id = 'IBM_X3650_M2';
update datatype set size = '{"y":2}' where id = 'IBM_V5000';
update datatype set size = '{"y":2}' where id = 'IBM_V3700';
update datatype set size = '{"y":4}' where id = 'IBM_Power720';

update datatype set size = '{"y":4}' where id = 'IBM_Power570';
update datatype set size = '{"y":4}' where id = 'IBM_P740';
update datatype set size = '{"y":1}' where id = 'IBM_7316_TF3';
update datatype set size = '{"y":4}' where id = 'IBM_3850_X5';
update datatype set size = '{"y":2}' where id = 'IBM_3750_M4';
update datatype set size = '{"y":2}' where id = 'IBM_3650_M4';
update datatype set size = '{"y":1}' where id = 'IBM_3550_M4';
update datatype set size = '{"y":1}' where id = 'IBM_1754_HC3';
update datatype set size = '{"y":2}' where id = 'huawei_ar3200_series';
update datatype set size = '{"y":2}' where id = 'hongtaigaoke_HTECH6000';
update datatype set size = '{"y":2}' where id = 'haikangweishi_weizhixinghao01';
update datatype set size = '{"y":2}' where id = 'casco_stby_u';
update datatype set size = '{"y":1}' where id = 'anzhiyuan_sps4008';
update datatype set size = '{"y":2}' where id = 'anzhiyuan_csc100';

update datatype set size = '{"y":2}' where id = 'yanhua_weizhixinghao02';
update datatype set size = '{"y":2}' where id = 'yanhua_weizhixinghao01';
update datatype set size = '{"y":4}' where id = 'yanhua_610h';
update datatype set size = '{"y":1}' where id = 'qnap_weizhixingghao01';
update datatype set size = '{"y":6}' where id = 'cisco_asr_1006';
update datatype set size = '{"y":3}' where id = 'cisco_7200series_vxr';
update datatype set size = '{"y":1}' where id = 'Cisco_3900';
update datatype set size = '{"y":1}' where id = 'cisco_2900';
update datatype set size = '{"y":1}' where id = 'HW_Secoway_USG2000';
update datatype set size = '{"y":2}' where id = 'IBM_X3650_M4';

-- v1.0.21
update config set version = 'v1.0.21';

-- alex 2016-01-19
DROP table IF  EXISTS `alarm_status`;
CREATE TABLE `alarm_status` (  `status_code` varchar(255) NOT NULL,  `status_name` varchar(255) ,  `action` enum('create','delete') DEFAULT 'create',  `createdAt` datetime ,  `updatedAt` datetime ,  PRIMARY KEY (`status_code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;

alter table alarm add `status`  varchar(50) DEFAULT NULL;

-- chaos 2017-01-20
alter table bo_property add description varchar(50) DEFAULT NULL;

-- update bo_property set property="Fan P" where property="FanP";
-- INSERT INTO `channel` VALUES ('NYFHttpComm','NYFHttpComm','192.168.1.159','8080','NYFProtocol',10000,'',1,'2017-01-20 07:23:15','2017-01-20 08:16:47');

-- alex 2017-01-22
alter table bo_property add label varchar(255) DEFAULT NULL;

-- v1.0.22

update config set version = 'v1.0.22';

-- andy 2017-02-03
alter table alarm_severity add system boolean DEFAULT false;
update alarm_severity set system = true where id in ('cleared', 'indeterminate', 'warning', 'minor', 'major', 'critical');


-- Kevin 2017-02-13

alter table scene modify `scene_type` enum('','ShowDescendant','ShowChildren','ShowSelfAndChildren','ShowSelfAndDescendant','ShowSelf','ShowThird') DEFAULT 'ShowSelf';

-- v1.0.23

update config set version = 'v1.0.23';

alter table alarm_log drop column extend;
alter table alarm_log add client text;

-- kevin 2017-02-21
-- v1.0.24 

update config set version = 'v1.0.24';


alter table config add `u_color_config` varchar(255) DEFAULT NULL;

update config set u_color_config = '[{"fromU":"1","toU":"1","color":"#8A0808"},{"fromU":"2","toU":"2","color":"#088A08"},{"fromU":"3","toU":"3","color":"#B18904"},{"fromU":"4","toU":"4","color":"#6A0888"},{"fromU":"5","toU":"","color":"#088A85"}]';

update category set stop_alarm_propagationable = 0 where id in ('equipment', 'card', 'port', 'light');
update category set stop_alarm_propagationable = 1 where id not in ('equipment', 'card', 'port', 'light');


-- v1.0.25 

update config set version = 'v1.0.25';

-- zhonghang

update datatype set model = 'twaver.idc.IBM_X3850_X5.device' where model = 'twaver.idc.IBM_3850_X5.device';

update datatype set model = 'twaver.idc.IBM_X3550_M4.device' where model = 'twaver.idc.IBM_3550_M4.device';

-- v1.0.26 

update config set version = 'v1.0.26';

-- Andy 增加机位
insert into category values('seat',true,'机位',true,false,false,'','2017-02-28 15:00:00','2017-02-28 15:00:00')
insert into datatype values('seat','seat','机位',1,1,'twaver.idc.seat','{}','','','','','','',true,true,true,false,false,'','',true,100,100,'',false,'2017-02-28 15:00:00','2017-02-28 15:00:00')
insert into datatype values('rack47_seat','seat','机位',1,1,'twaver.idc.seat','{}','','','','','','',true,true,true,false,false,'','',true,100,100,'',false,'2017-02-28 15:00:00','2017-02-28 15:00:00')

-- v1.0.27 

update config set version = 'v1.0.27';

create table pdf_info(`id` varchar(255) not null default '' primary key,name varchar(255) not null default '',path varchar(225) not null default '',`createdAt` datetime default null,`updatedAt` datetime default null,description varchar(255) not null default '');


-- v1.0.28

-- 2017-03-16 Kevin

update config set version = 'v1.0.28';

alter table datatype add business_type_id varchar(255) default null; 

-- andy 2017-03-16
alter table business_type add `icon` varchar(255) DEFAULT NULL;

-- 2017-03-24 Kevin

-- v1.0.29

update config set version = 'v1.0.29';

-- 2017-04-01 Kevin

-- v1.0.30

update config set version = 'v1.0.30';

-- 2017-04-01 alisa

-- v1.1.0

update config set version = 'v1.1.0';

-- 2017-05-02 alisa

-- v1.1.1

update config set version = 'v1.1.1';

alter table alarm add `original_device_id` varchar(255);
alter table alarm_log add `original_device_id` varchar(255);

-- Kevin 2017-05-11

alter table datatype modify `simple_model_parameters` longtext; 
-- 2017-05-12 alisa

-- v1.1.2

-- 2017-05-16 alisa

-- v1.1.3

-- Andy 2017-05-18
alter table business_object drop primary key;
alter table business_object add ii int(11) auto_increment primary key first;

alter table bo_property drop primary key;
alter table bo_property add ii int(11) auto_increment primary key first;

alter table relation drop primary key;
alter table relation add ii int(11) auto_increment primary key first;

-- 2017-05-18 andy
alter table camera_animate add `repeat` int not null default 1;
alter table camera_animate add `auto` tinyint(1) not null default 0;
alter table camera_animate drop index `name`;


-- Alex 2017-05-23
DROP TABLE IF EXISTS `temp_asset`;
CREATE TABLE `temp_asset` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(255) DEFAULT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `business_type_id` varchar(255) DEFAULT NULL,
  `location` int(2) NOT NULL DEFAULT 0,
  `height` int(2) NOT NULL DEFAULT 0,
  `is_equipment` tinyint(1) not null default 0,
  `extend` varchar(255) DEFAULT NULL,
  `createdAt` datetime not null default '1970-01-01 01:01:01',
  `updatedAt` datetime not null default '1970-01-01 01:01:01',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- alisa 2017-05-24
update config set version = 'v1.1.3';

-- v1.1.4
-- 2017-05-24
update config set version = 'v1.1.4';
	
-- v1.1.5
-- 2017-05-25
update config set version = 'v1.1.5';

-- v1.1.6

update config set version = 'v1.1.6';
-- Jay.xu 2017-06-01
alter table config add column temp_more_config varchar(512);
alter table config add column hum_more_config varchar(512); 

-- 2017-05-25

-- v1.1.7

update config set version = 'v1.1.7';

alter table config add asset_manage_image varchar(255) default "";

-- Jay.xu 2017-06-14
UPDATE config SET temp_more_config = '{"font_color":"#000000","font_size":"40","font_family":"microsoft yahei","font_linewidth":"4","writeunit":true,"stroke":false,"canvasX":"204","canvasY":"430","startX":"75","startY":"220","billboardX":"104","billboardY":"230"}';
UPDATE config SET hum_more_config = '{"font_color":"#000000","font_size":"50","font_family":"microsoft yahei","font_linewidth":"5","writeunit":true,"stroke":false,"canvasX":"318","canvasY":"442","startX":"100","startY":"300","billboardX":"150","billboardY":"200"}';
alter table config modify column asset_manage_image varchar(255) default "";
UPDATE config SET asset_manage_image = "./images/assetDefaultImage.png";

-- alisa 2017-06-15
update datatype set model ='twaver.idc.equipment1.device' where model='twaver.idc.equipment1';
update datatype set model ='twaver.idc.equipment2.device' where model='twaver.idc.equipment2';
update datatype set model ='twaver.idc.equipment3.device' where model='twaver.idc.equipment3';
update datatype set model ='twaver.idc.equipment4.device' where model='twaver.idc.equipment4';
update datatype set model ='twaver.idc.equipment5.device' where model='twaver.idc.equipment5';
update datatype set model ='twaver.idc.equipment6.device' where model='twaver.idc.equipment6';
update datatype set model ='twaver.idc.equipment7.device' where model='twaver.idc.equipment7';
update datatype set model ='twaver.idc.equipment8.device' where model='twaver.idc.equipment8';


-- alisa 2017/6/20
-- v1.1.8  
update config set version = 'v1.1.8';


	
-- Jay.xu 2017-06-16

alter table config add column show_temphum_alarm varchar(255);
alter table config add column is_animate_tempfield varchar(255);
alter table config add column is_Virtual_Others varchar(255);
update config set show_temphum_alarm='true';
update config set is_animate_tempfield='false';
update config set is_Virtual_Others='true';
alter table config modify temp_more_config varchar(512);
alter table config modify hum_more_config varchar(512);
update config set temp_more_config='{"font_color":"#000000","font_size":"40","font_family":"microsoft yahei","font_linewidth":"4","writeunit":true,"stroke":false,"canvasX":"204","canvasY":"430","startX":"75","startY":"220","billboardX":"104","billboardY":"230","bluesrc":"./images/tem_blue.jpeg","greensrc":"./images/tem_green.jpeg","yellowsrc":"./images/tem_yellow.jpeg","redsrc":"./images/tem_red.jpeg"}';
update config set hum_more_config='{"font_color":"#000000","font_size":"50","font_family":"microsoft yahei","font_linewidth":"5","writeunit":true,"stroke":false,"canvasX":"318","canvasY":"442","startX":"100","startY":"300","billboardX":"150","billboardY":"200","bluesrc":"./images/hum_blue.jpeg","greensrc":"./images/hum_green.jpeg","yellowsrc":"./images/hum_yellow.jpeg","redsrc":"./images/hum_red.jpeg"}';
update config set hum_alarm_config='{"hum_blue":["0","20"],"hum_green":["20","30"],"hum_yellow":["30","40"],"hum_red":["40","100"]}';
update config set temp_alarm_config='{"tem_blue":["0","20"],"tem_green":["20","25"],"tem_yellow":["25","30"],"tem_red":["30","100"]}';

alter table config add filter_asset_list varchar(255);
alter table config add un_virtual_category varchar(255);
update config set filter_asset_list='';
update config set un_virtual_category='';


-- alisa 2017/6/22
-- v1.1.9 
update config set version = 'v1.1.9';
--faye.wang 2017-06-21

-- create procedure  addcard (in equipment varchar(255))
--      BEGIN
--   declare t int default 0;
-- declare card varchar(255) default 'card';
--   set @count =  (select count(id) from data where data_type_id = equipment);
-- label:loop
-- set @parent_id = (select id from data where data_type_id = equipment limit t,1);
--  insert into data (id,name,description,position,position2d,rotation,location,parent_id,data_type_id,createdAt,updatedAt)
--       values(
--       concat(card,t),'板卡','板卡','{"x":"","y":"","z":""}','{"x":"","y":"","z":""}','{"x":"","y":"","z":""}','{"x":"6","y":"5","z":"pos_pos"}',
--       @parent_id,
--       'card',now(),now()
--       );
-- set t=t+1;
-- if t>@count-1 then leave label;
-- end if;
-- end loop label;  
-- END

-- call addCard('equipment8');

-- alisa 增加1-8U设备端口
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment2.panel"},{"height":20.54,"position":[21,67,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"height":20.54,"position":[21,48,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"height":20.54,"position":[21,20.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"height":20.54,"position":[21,1.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,1,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,20,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,47.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,66.5,0],"client":{"decoration":false,"bid":""},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[265,20,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[265,1,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[265,66.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[350,20,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[350,47.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[350,67,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[350,1,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[265,46.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"position":[220,38,0],"client":{"decoration":false},"id":"twaver.idc.button_02.panel"}]' where id='equipment2';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment3.panel"},{"width":74.79,"height":20.54,"position":[27.5,23,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[27.5,47.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[27.5,67,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[27.5,91,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[27.5,110.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[27.5,3,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,3,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,22,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,47.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,67,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,91,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,2,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,22,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,47,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,90,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,66.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[115,110.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[264.5,110.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,0.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,22,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,47.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,67,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,91,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":74.79,"height":20.54,"position":[356.5,110.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"position":[220,61.5,0],"client":{"decoration":false},"id":"twaver.idc.button-power.panel"}]' where id='equipment3';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment4.panel"},{"position":[42.5,8.5,0],"client":{"decoration":false},"id":"twaver.idc.button-power.panel"},{"width":85.79,"position":[31,140,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[132.5,140,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[236,140,0],"client":{"decoration":false,"bid":""},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[31,158.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[132.5,158.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[236,158.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[337,140,0],"client":{"decoration":false,"bid":""},"id":"twaver.idc.disk_27.panel"},{"width":85.79,"position":[337,158.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"}]' where id='equipment4';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment5.panel"},{"position":[401,7.5,0],"client":{"decoration":false},"id":"twaver.idc.button-power.panel"},{"width":89.93,"position":[30.5,183,0],"client":{"decoration":false},"id":"twaver.idc.disk_25.panel"},{"width":89.93,"position":[121.5,183,0],"client":{"decoration":false},"id":"twaver.idc.disk_25.panel"},{"width":89.93,"position":[31,143,0],"client":{"decoration":false},"id":"twaver.idc.disk_25.panel"},{"width":89.93,"position":[121.5,143,0],"client":{"decoration":false},"id":"twaver.idc.disk_25.panel"},{"width":160.41,"position":[261.5,183.5,0],"client":{"decoration":false},"id":"twaver.idc.disk_26.panel"},{"width":160.41,"position":[261.5,143,0],"client":{"decoration":false},"id":"twaver.idc.disk_26.panel"},{"width":89.79,"height":15.54,"position":[53.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[38.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[23.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[8.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[-6.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[68.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[143.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[128.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[113.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[98.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[83.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[158.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[173.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[188.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[203.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":89.79,"height":15.54,"position":[218.5,42,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"}]' where id='equipment5';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment6.panel"},{"position":[128,195.5,0],"client":{"decoration":false},"id":"twaver.idc.button-power.panel"},{"width":86.79,"height":17.54,"position":[64.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[81.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[47.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[30.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[13.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[98.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[-3.5,40.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[-3.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[13.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[30.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[47.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[64.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[81.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":86.79,"height":17.54,"position":[98.5,134.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"height":4.32,"position":[331,36.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"},{"height":4.32,"position":[298.5,36.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"},{"height":4.32,"position":[298.5,81.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"},{"height":4.32,"position":[331.5,81.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"},{"height":4.32,"position":[298.5,125.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"},{"height":4.32,"position":[330,125.5,0],"client":{"decoration":false},"id":"twaver.idc.port_42.panel"}]' where id='equipment6';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment7.panel"}]' where id='equipment7';
update datatype set model2d_parameters='[{"id":"twaver.idc.equipment8.panel"},{"position":[409,275.5,0],"client":{"decoration":false},"id":"twaver.idc.button-power.panel"},{"width":87.79,"position":[-12.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[22.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[40,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[57.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[75,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[92.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[110,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[127.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[145,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[162.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[180,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[197.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[215,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[232.5,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"},{"width":87.79,"position":[250,297.5,0],"rotation":[0,0,90],"client":{"decoration":false},"id":"twaver.idc.disk_27.panel"}]' where id='equipment8';

-- add by andy
alter table camera_animate_action add fps_mode tinyint(1);

-- alisa 2017/6/22

update config set version = 'v1.2.0';
-- v1.2.1

-- jay.xu 2017/7/5
update config set temp_more_config='{"font_color":"#000000","font_size":"40","font_family":"microsoft yahei","font_linewidth":"4","writeunit":true,"stroke":false,"canvasX":"204","canvasY":"430","startX":"75","startY":"220","billboardX":"104","billboardY":"230","bluesrc":"./images/tem_blue.png","greensrc":"./images/tem_green.png","yellowsrc":"./images/tem_yellow.png","redsrc":"./images/tem_red.png"}';
update config set hum_more_config='{"font_color":"#000000","font_size":"50","font_family":"microsoft yahei","font_linewidth":"5","writeunit":true,"stroke":false,"canvasX":"318","canvasY":"442","startX":"100","startY":"300","billboardX":"150","billboardY":"200","bluesrc":"./images/hum_blue.png","greensrc":"./images/hum_green.png","yellowsrc":"./images/hum_yellow.png","redsrc":"./images/hum_red.png"}';



-- Kevin 2017-07-10

alter table link add route_type varchar(255) not null default '';
alter table link add from_ip_address varchar(20) not null default '';
alter table link add to_ip_address varchar(20) not null default '';



-- Alex 2017-07-13
alter table category add column level int;
alter table relation add column `group` varchar(50);

update category set level = 1 where id = 'earth';
update category set level = 10 where id = 'dataCenter';
update category set level = 20 where id = 'building';
update category set level = 30 where id = 'floor';
update category set level = 40 where id = 'room';
update category set level = 50 where id = 'channel';
update category set level = 60 where id = 'rack';
update category set level = 60 where id = 'headerRack：60';
update category set level = 60 where id = 'office';
update category set level = 60 where id = 'fireControl';
update category set level = 60 where id = 'camera';
update category set level = 60 where id = 'cabinate';
update category set level = 70 where id = 'equipment';
update category set level = 80 where id = 'card';
update category set level = 90 where id = 'port';
update category set level = 90 where id = 'seat';

-- alisa 2017/7/17

update config set version = 'v1.2.1';
-- v1.2.2
alter table category modify performance_url text NULL;

update datatype set model ='twaver.idc.equipment' where model='twaver.idc.equipment1.device';

-- alisa 2017/8/14

update config set version = 'v1.2.2';
-- v1.2.3

-- Kevin 
alter table scene add pre_render tinyint(1) not null default 0;
-- andy simple node support no prefab config
alter table datatype add `no_simple_prefab_able` boolean DEFAULT false;


-- Kevin 2017-09-04

alter table collector add data varchar(255) default null;

update config set version = 'v1.2.3';

-- v1.2.4
-- alisa 2017-10-13

update config set version = 'v1.2.4';

-- v1.2.5

-- alisa 2017-12-06
update config set version = 'v2.2';

-- v2.3

-- Alex 2017-12-06
alter table temp_asset add is_virtual tinyint(1) NOT NULL default 0;

-- yangxingkang 2017-12-19
alter table custom_column add column_display_name varchar(255) NOT NULL default '';

-- alisa 2017-12-25
update config set version = 'v2.3';

-- v2.4

-- chenghui 2018-01-05
DROP TABLE IF EXISTS `port`;
CREATE TABLE `port`(`id` varchar(255) NOT NULL,  `port_num` varchar(255) NOT NULL, `side` tinyint(1) DEFAULT false,  `port_status` tinyint(1) DEFAULT NULL,`port_id` varchar(255)  DEFAULT NULL, `createdAt` datetime NOT NULL,  `updatedAt` datetime NOT NULL,  PRIMARY KEY (`id`,`port_num`)) DEFAULT CHARSET=utf8;

INSERT INTO port(id,port_num,side,createdAt,updatedAt) select d.id as dataId,td.id,td.side,NOW(),NOW() from data as d LEFT JOIN datatype as dt on d.data_type_id = dt.id LEFT JOIN template_data as td on dt.id = td.parent_data_type_id WHERE td.id is not NULL AND td.side is NOT NULL;

-- Kevin 2018-01-05
alter table it_config_item add parent_id varchar(255) not null default '';

alter table it_config_item add position varchar(255) default null;

-- alisa 2018-01-08
update config set version = 'v2.4';

-- v2.5

-- lyz 2018-01-10
update category set search_filter = 0 where id = 'channel';
update category set search_filter = 1 where id = 'dianchizu';

--hu 2018-1-12
update popup set props = replace(props,'型号','品牌') where id = 'rack' or id = 'headerRack';

-- Alex 2018-01-08
alter table user add roleId varchar(255);

-- yangxingkang 2018-01-18
insert into category values('smoke',true,'烟感',true,true,false,null,now(),now(),1);
update datatype set category_id = 'smoke' where id = 'yangan2';
update datatype set category_id = 'smoke' where id = 'yangan';

--aZhuang 2018-01-22
 alter table config add asset_statistics_obj varchar(255);

 --loda 2018-01-23
 update config set is_virtual_Others = 'false' where id = 'system';

 --aZhuang 2018-01-24
 alter table config add temp_field_arr varchar(255);
 -- alisa 2018-01-29
update config set version = 'v2.5';
-- v2.5.1
--aZhuang 2018-02-01
alter table config alter column asset_statistics_obj set default '{"业务类型": "Echart-pie"}';
update config set asset_statistics_obj='{"业务类型": "Echart-pie"}';
update data set  business_type_id = (select  business_type_id from datatype where datatype.id = data.data_type_id);



--aZhuang 2018-02-01
update custom_column set column_display_name = 'IP地址' where table_name = 'equipment_custom' and column_name = 'ip';
update custom_column set column_display_name = '模型' where table_name = 'equipment_custom' and column_name = 'model';
update custom_column set column_display_name = '品牌' where table_name = 'equipment_custom' and column_name = 'brand';
alter table config change asset_statistics_obj asset_statistics_arr varchar(512);
alter table config alter column asset_statistics_arr set default '[{"columnName": "businessType","columnDisplayName": "业务类型", "chartType": "Echart-pie"}]';
update config set asset_statistics_arr='[{"columnName": "businessType","columnDisplayName": "业务类型", "chartType": "Echart-pie"}]';

 -- alisa 2018-02-13
update config set version = 'v2.5.2';
-- v2.6
--jay xu
alter table it_relation add calculate tinyint(1) NOT NULL DEFAULT '0';

--hujinwei
INSERT INTO `menu` VALUES ('temp_asset', '', '/temp_asset', '同步资产', NULL, 'server', '2018-2-8 18:09:57', '2018-2-8 18:09:57');
INSERT INTO `permission` VALUES ('temp_asset', 'temp_asset', '', NULL, '2018-2-8 18:09:57', '2018-2-8 18:09:57');
INSERT INTO `roleofpermission` VALUES ('admin', 'temp_asset', false, '', '2018-2-8 18:09:57', '2018-2-8 18:09:57');

--lyz 2018-03-02
ALTER TABLE panoramic ADD image_type INT DEFAULT '6' AFTER arrows;