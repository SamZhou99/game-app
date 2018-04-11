var crypto = require('crypto');
var http = require('http');
var querystring = require('querystring');


var CommonUtils = {
    moment: require('moment'),//moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    lodash: require('lodash'),
    async: require("async"), //串行 series, 迭代串行 eachSeries, 并行 parallel ,迭代并行 each  , , ,  ,
    Out:function () {
        var a = arguments;
        var len = a.length;
        switch (len){
            case 1:
                console.log(CommonUtils.Common.Now(), a[0]);
                break;
            case 2:
                console.log(CommonUtils.Common.Now(), a[0], a[1]);
                break;
            case 3:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2]);
                break;
            case 4:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3]);
                break;
            case 5:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3], a[4]);
                break;
            case 6:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3], a[4], a[5]);
                break;
            case 7:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
                break;
            case 8:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
                break;
            case 9:
                console.log(CommonUtils.Common.Now(), a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
                break;
        }
    },
    Common: {
        //接收参数扩展
        RequestExtend: function (req, res, next) {
            function ExtendObj(SourceObj, CurrentObj) {
                if(!SourceObj) return null;
                if(!CurrentObj) return null;
                for(var key in CurrentObj){
                    SourceObj[key] = CurrentObj[key];
                }
            }
            ExtendObj(req.params, req.body);
            ExtendObj(req.params, req.query);
            next();
        },
        //获取客户端IP
        GetIP:function (req) {
            var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
            return ip;
        },
        //查检登录状态
        CheckLogin:function (req, res) {
            return req.session.IsLogin && req.session.IsLogin === 'true';
        },
        //检查管理员状态
        CheckAdminLogin:function(req, res){
            var b1 = (req.session.IsLogin && req.session.IsLogin === 'true');
            var b2 = (req.session.IsAdmin && req.session.IsAdmin === 1);
            return b1 && b2;
        },
        //md5 加密
        MD5:function (str32) {
            return crypto.createHash('md5').update(String(str32)).digest('hex');
        },
        //POST请求
        Post:function (host, filepath, data, callback) {
            var contents = querystring.stringify(data);
            var option = {
                method: 'post',
                host: host,
                prot: '80',
                path: filepath,
                headers: {
                    "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
                    "Content-Length":contents.length
                }
            };
            var dispose = function(res){
                var body = '';
                res.on('data',function(data){
                    body += data;
                });
                res.on('end',function(){
                    callback(null, body);
                });
            };
            var req = http.request(option, dispose);
            req.on('error', function (err) {
                // console.log('CommonUtils.Common.Post error : ', err);
                callback(err);
            });
            req.write(contents);
            req.end();
        },
        //当前时间
        Now:function () {
            return CommonUtils.moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        },
        //字符串工具
        String:{
            toInt:function(any, defaultValue){
                defaultValue = defaultValue || 0;
                return isNaN(parseInt(any)) ? defaultValue : parseInt(any);
            },
            toNumber:function(any, defaultValue){
                defaultValue = defaultValue || 0;
                return isNaN(Number(any)) ? defaultValue : Number(any);
            }
        },
        //Cookie操作
        Cookie:{
            GetObj:function (cookiesData) {
                if(!cookiesData) return null;
                if(cookiesData.length<3) null;
                var a = cookiesData.split('; ');
                var obj = {};
                for(var i=0; i<a.length; i++){
                    var aa = a[i].split('=');
                    obj[aa[0]] = aa[1];
                }
                return obj;
            }
        },
        //SessionId获取
        Session:{
            GetId:function (Cookie) {
                if( !(Cookie != null && Cookie['connect.sid'] != undefined) ) return null;
                return String(Cookie['connect.sid'].split('.')[0]).replace('s%3A','');
            }
        }
    }
};

module.exports = CommonUtils;