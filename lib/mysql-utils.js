var mysql = require("mysql");
var moment = require('moment');
var Conn, _Config, _Callback;
var _IsDebug;

var onHandleError = function (err) {
    // MysqlUtils.Close();
    var currTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    if(!err){
        _Callback();
        return;
    }
    console.log("mysql.err.code 【"+err.code+"】" + currTime);

    if(err.code === 'PROTOCOL_CONNECTION_LOST'){//mysql 联接失败

    }else if(err.code === 'ECONNREFUSED'){//mysql 断线重联
        onReconnection();
    }else if(err.code === 'ECONNRESET'){
        onReconnection();
    }else{
        console.error(err.stack || err);
    }
};
var onReconnection = function () {
    setTimeout(function () {
        Conn = null;
        MysqlUtils.ConfigInit(_Config);
    }, 2000);
};
var Common = {
    //替换全部
    ReplaceAll:function (sourceStr, replaceStr1, replaceStr2) {
        return sourceStr.replace(new RegExp(replaceStr1, "g"), replaceStr2);
    },
    //替换SQL数据
    ReplaceSqlData:function (sqlStr, parmObject) {
        if(!sqlStr){
            console.log('缺少参数 sqlStr');
            return;
        }
        if(!parmObject) return sqlStr;
        for(var key in parmObject){
            var value = parmObject[key];
            if(typeof value == 'string'){
                value = Common.ReplaceAll(value, "'", "''");
            }
            sqlStr = Common.ReplaceAll(sqlStr, "{"+key+"}", value);
        }
        return sqlStr;
    }
};

var MysqlUtils = {
    ConfigInit:function (Config, callback, isDebug) {
        _Callback = callback;
        _Config = Config;
        _IsDebug = Boolean(isDebug);
        if(Conn){
            console.log('ConfigInit数据库未初始化');
            return;
        }
        Conn = mysql.createConnection(_Config);
        Conn.connect(onHandleError);
        Conn.on('error', onHandleError);
    },
    Close:function () {
        if(!Conn) return;
        Conn.end();
        Conn = null;
    },
    Query:function (SqlStr, SqlParm, Callback) {
        if(!Conn){
            console.log('Query数据库未初始化');
            return;
        }
        SqlStr = Common.ReplaceSqlData(SqlStr, SqlParm);
        if(_IsDebug) console.log('SqlStr = '+SqlStr);
        Conn.query(SqlStr, function (err, result, fields) {
            if(err) console.log("SQL ClientError : ", err, '【'+SqlStr+'】');
            if(Callback){
                Callback(err, result, fields);
            }
        });


    }
};

module.exports = MysqlUtils;