var Config = require('../config-web.js');
var CommonData = require('./common-data');
var CommonUtils = require('./common-utils');
var RedisUtils = require('./redis-utils');
var MysqlPoolUtils = require('./mysql-pool-utils')(false);
// var FS = require('fs');

/**
 * 专门针对数据库操作功能
 */
var DalFactory = {
    Common:{
        Data:{
            InitCount: 0,
            IsInit: false
        }
    },
    /********************************************
     * 初始化
     ********************************************/
    Init:function(callback, isRedisInit){
        if(DalFactory.Common.Data.IsInit) return;
        CommonUtils.async.parallel([
            function (next) {
                if(!isRedisInit){
                    next();
                    return;
                }
                //RedisDB1初始化
                RedisUtils.Init(Config.Db.RedisDB0, function (err) {
                    if(err){
                        callback( CommonData.NewResultFormat(CommonData.DalError.RedisInitError) );
                        return;
                    }
                    CommonUtils.Out('Redis DB0 初始化成功! ');
                    next();
                });
            },
            function (next) {
                //MySQL初始化
                MysqlPoolUtils.ConfigInit(Config.Db.Mysql.main_db, function (err, result) {
                    MysqlPoolUtils.Query("SELECT * FROM user_info LIMIT 1", null, function (err, result) {
                        if(err){
                            callback( CommonData.NewResultFormat(CommonData.DalError.MysqlInitError) );
                            return ;
                        }
                        CommonUtils.Out('MysqlPoolUtils 初始化成功! ');
                        next();
                    });
                });
            }
        ], function (err) {
            if(err){
                callback( CommonData.NewResultFormat(CommonData.DalError.RedisInitError) );
                return;
            }
            callback( CommonData.NewSuccessFormat() );
        });
    },
    /********************************************
     * Mysql 操作
     ********************************************/
    Mysql:{
        //通过session id 获取 用户信息
        SessionId_GetUserInfo:function (session_id, callback) {
            var sqlParam = {
                log_session: session_id
            };
            var SQL = "SELECT " +
                "ui.user_id, ui.user_name, ui.user_is_admin, ul.log_session " +
                "FROM " +
                "user_info AS ui, log_user_login AS ul " +
                "WHERE " +
                "ul.log_session = '{log_session}' AND ui.user_id = ul.log_user_id " +
                "LIMIT 1;";
            MysqlPoolUtils.Query(SQL, sqlParam, function (err, result, fields) {
                if(err){
                    callback( CommonData.NewFailedFormat(CommonData.DalError.MysqlSessionUserInfoError, err.code) );
                    return;
                }
                callback( CommonData.NewSuccessFormat(result) );
            }, false);
        },
        //用户注册
        UserRegister: function (userName, userPassword, userIP, callback) {
            var sqlParam = {
                user_name: userName,
                user_password: userPassword,
                user_is_admin: 0,
                user_ip: userIP,
                create_datetime: 'NOW()'
            };
            CommonUtils.async.series([
                function (next) {
                    //用户是否存在
                    DalFactory.Mysql.GetUserInfo(null, userName, null, function (data, result) {
                        if(data.flag != 0){
                            callback( data );
                            return;
                        }
                        if(result.length >= 1){
                            callback( CommonData.NewFailedFormat(CommonData.ClientError.RegUserRepeatError) );
                            return;
                        }
                        next();
                    })
                },
                function (next) {
                    //用户IP重复注册间隔
                    CommonUtils.Out('userIP >>>>>>>>>', userIP);
                    DalFactory.Mysql.GetUserInfoAtIP(userIP, function (data, result) {
                        if(data.flag != 0){
                            callback( data );
                            return;
                        }
                        if(result.length > 0){
                            //已有重复IP
                            //检查相隔时间
                            var nowTime = new Date().getTime();
                            var oldTime = new Date(result[0].create_datetime).getTime();
                            var diffTime = Math.floor((nowTime-oldTime)/1000);
                            var hTime = parseInt(diffTime/60/60);
                            var mTime = parseInt(diffTime/60);
                            CommonUtils.Out("userId:"+result[0].user_id, "hTime:"+hTime, "mTime:"+mTime);
                            if(mTime < 10){
                                callback( CommonData.NewFailedFormat(CommonData.ClientError.RegUserRepeatIPError) );
                                return;
                            }
                        }
                        next();
                    })
                },
                function (next) {
                    //写入用户数据
                    var SQL = "INSERT INTO user_info " +
                        "(user_name, user_password, user_is_admin, user_ip, create_datetime) VALUES " +
                        "('{user_name}', '{user_password}', '{user_is_admin}', '{user_ip}', {create_datetime})";
                    MysqlPoolUtils.Query(SQL, sqlParam, function (err, result) {
                        if(err){
                            callback( CommonData.NewFailedFormat(CommonData.DalError.MysqlError, err.code) );
                            return;
                        }
                        next();
                    });
                }
            ], function (err) {
                if(err){
                    callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultAbnormal, err.code) );
                    return;
                }
                callback( CommonData.NewSuccessFormat() );
            });

        },
        //用户登录
        UserLogin: function (userName, userPassword, userIP, userSession, userReferer, userAgent, callback) {
            DalFactory.Mysql.GetUserInfo(null, userName, userPassword, function (data, result) {
                if(data.flag != 0){
                    callback( data );
                    return;
                }
                if(result.length <= 0){
                    callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultVoid) );
                    return;
                }
                if(result.length > 1){
                    callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultAbnormal) );
                    return;
                }
                DalFactory.Mysql.UserLoginAddLog(result[0].user_id, userIP, userSession, userReferer, userAgent, function (data) {
                    if(data.flag != 0){
                        callback( data );
                        return;
                    }
                    callback( CommonData.NewSuccessFormat(result[0]));
                });
            });
        },
        //添加 用户登录记录
        UserLoginAddLog: function(user_id, user_ip, session_id, referer, agent, callback){
            var sqlParam = {
                log_user_id: user_id,
                log_user_ip: user_ip,
                log_session: session_id,
                log_referer: referer,
                log_agent: agent,
                create_datetime: 'NOW()'
            };
            var SQL = "INSERT INTO log_user_login " +
                "(log_user_id, log_user_ip, log_session, log_referer, log_agent, create_datetime) VALUES " +
                "('{log_user_id}', '{log_user_ip}', '{log_session}', '{log_referer}', '{log_agent}', {create_datetime})";
            MysqlPoolUtils.Query(SQL, sqlParam, function (err, result) {
                if(err){
                    callback( CommonData.NewFailedFormat(CommonData.DalError.MysqlError, err.code) );
                    return;
                }
                callback( CommonData.NewSuccessFormat(), result );
            });
        },
        //通过用户名密码 查询 用户信息
        GetUserInfo: function (userId, userName, userPasswordMd5, callback) {
            var sqlParam = {
                user_id: userId,
                user_name: userName,
                user_password: userPasswordMd5
            };
            var SQL = "";
            if(sqlParam.user_name && sqlParam.user_password){
                SQL = "SELECT user_id, user_name, user_is_admin " +
                    "FROM user_info " +
                    "WHERE user_name='{user_name}' AND user_password='{user_password}' " +
                    "LIMIT 10";
            }
            else if(sqlParam.user_name){
                SQL = "SELECT user_id, user_name, user_is_admin " +
                    "FROM user_info " +
                    "WHERE user_name='{user_name}' " +
                    "LIMIT 1";
            }
            else if(sqlParam.user_id){
                SQL = "SELECT user_id, user_name, user_is_admin " +
                    "FROM user_info " +
                    "WHERE user_id='{user_id}' " +
                    "LIMIT 1";
            }
            else{
                callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultAbnormal) );
                return;
            }
            MysqlPoolUtils.Query(SQL, sqlParam, function (err, result, fields) {
                if(err){
                    callback( CommonData.NewFailedFormat(CommonData.DalError.MysqlError, err.code) );
                    return;
                }
                if(!result){
                    callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultNull) );
                    return;
                }
                callback( CommonData.NewSuccessFormat(), result );
            });
        },
        //用IP查询用户信息
        GetUserInfoAtIP: function(userIP, callback){
            var sqlParam = {
                user_ip: userIP
            };
            var SQL = "SELECT user_id, user_name, user_is_admin, user_ip, create_datetime " +
                "FROM user_info " +
                "WHERE user_ip='{user_ip}' " +
                "ORDER BY `user_id` DESC " +
                "LIMIT 1";
            MysqlPoolUtils.Query(SQL, sqlParam, function (err, result, fields) {
                if(err){
                    callback( CommonData.NewFailedFormat(CommonData.DalError.MysqlError, err.code) );
                    return;
                }
                if(!result){
                    callback( CommonData.NewFailedFormat(CommonData.CommonError.ResultNull) );
                    return;
                }
                callback( CommonData.NewSuccessFormat(), result );
            });
        }
    },
    /********************************************
     * Redis 操作
     ********************************************/
    Redis:{
        //清除一些数据 Game_Table 半小时, Result_Table_ShowNum 一分钟后已读 的数据。
        DeleteGameAndResultData:function (callback) {
            var keyArr = [];
            function _RedisDelKey(keyName, callback) {
                //Redis删除
                RedisUtils.Del(keyName, function (err) {
                    if(err){
                        CommonUtils.Out('DeleteGameAndResultData', err);
                        return;
                    }
                    callback();
                });
            }
            function _MySqlResultIsRead(parm, callback) {
                //Mysql Result.IsRead
                DalFactory.ServerResultLogIsRead(parm, function (err, result) {
                    callback();
                });
            }
            function _MySqlRoadIsRead(parm, callback) {
                //Mysql Road.IsRead
                DalFactory.ServerRoadLogIsRead(parm, function (err, result) {
                    callback();
                });
            }
            CommonUtils.async.series([
                function (next) {
                    RedisUtils.Keys('*', function (err, result) {
                        keyArr = result;
                        next();
                    });
                },
                function (next) {
                    CommonUtils.async.each(keyArr, function (keyName, callback) {
                        var CheckIsRead = '3';//深圳方：房间数据读取3次，+1累积值(因为一个房间分了三个类型，普通高级贵宾)。
                        if(keyName.indexOf('Game_') != -1){
                            RedisUtils.Redis.hmget(keyName, 'Status', 'CreateDate', function (err, result) {
                                result[1] = new Date(result[1]).getTime();
                                //半小时
                                if(result[0] != CommonData.GameRoom.Status.GameStart
                                    && new Date().getTime() > Math.floor(result[1])+1000*60*30)
                                {
                                    _RedisDelKey(keyName, callback);
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                        else if(keyName.indexOf('Road_') != -1){
                            RedisUtils.HGetAll(keyName, function (err, result) {
                                result.CreateDate = new Date(result.CreateDate).getTime();
                                if(result.IsRead == CheckIsRead && new Date().getTime() > Math.floor(result.CreateDate)+1000*60){//一分钟
                                    CommonUtils.async.parallel([
                                        function (next) {
                                            _MySqlRoadIsRead({
                                                road_table: result.Table,
                                                road_show_num: result.ShowNum
                                            }, next);
                                        },
                                        function (next) {
                                            _RedisDelKey(keyName, next);
                                        }
                                    ],function (err) {
                                        if(err) return;
                                        callback();
                                    });
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                        else if(keyName.indexOf('Result_') != -1){
                            RedisUtils.HGetAll(keyName, function (err, result) {
                                result.CreateDate = new Date(result.CreateDate).getTime();
                                if(result.IsRead == CheckIsRead && new Date().getTime() > Math.floor(result.CreateDate)+1000*60){//一分钟
                                    CommonUtils.async.parallel([
                                        function (next) {
                                            _MySqlResultIsRead(result, next);
                                        },
                                        function (next) {
                                            _RedisDelKey(keyName, next);
                                        }
                                    ],function (err) {
                                        if(err) return;
                                        callback();
                                    });
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                        else{
                            callback();
                        }
                    },function (err) {
                        if(err){
                            CommonUtils.Out('dal-factory CommonUtils.async.each error : ', err.code);
                            return;
                        }
                        next();
                    });
                }
            ], function (err) {
                if(err){
                    CommonUtils.Out('DeleteGameAndResultData ClientError :', err.code);
                    return;
                }
                callback(err, 'ok');
            });
        }
    }
};
module.exports = DalFactory;