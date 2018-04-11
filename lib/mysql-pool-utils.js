var Mysql = require("mysql");
var Options = {};
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
var MysqlPoolUtils = function (IsDebug) {
    var _This = {
        IsDebug: IsDebug,
        Pool: null,
        Config: null,
        ConfigInit: function (Config, Callback) {
            _This.Config = Config;
            _This.Pool = Mysql.createPool(_This.Config);
            Callback(null, 'ok', null);
        },
        Query: function (SqlStr, SqlParm, Callback, ThisIsDebug) {
            _This.Pool.getConnection(function(err, conn){
                if(err){
                    Callback(err, null, null);
                }
                else{
                    SqlStr = Common.ReplaceSqlData(SqlStr, SqlParm);
                    if(ThisIsDebug || _This.IsDebug){
                        console.log('>>>>>>>>>>> SQL Debug >>>>>>>>>>>');
                        console.log(SqlStr);
                        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
                    }
                    conn.query(SqlStr, Options, function(err, results, fields){
                        //释放连接
                        conn.release();
                        //事件驱动回调
                        Callback(err, results, fields);
                    });
                }
            });
        }
    };
    return _This;
};

module.exports = MysqlPoolUtils;