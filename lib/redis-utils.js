var redis = require("redis");
var moment = require('moment');//moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
var _Config = null;

var redisUtils = module.exports = {
    Redis: null,
    Config: {
        db: 0,
        port: 6379,         //端口
        host: '127.0.0.1',  //服务器IP
        opts: {}            //密码
    },
    Data: {
        Temp: 0,
        IsInit: false
    },
    //初始化
    Init:function(Config, callback){
        var _this = redisUtils;
        _Config = Config || RedisUtils.Config;
        if(_this.Redis){
            _this.Redis = null;
        }
        _this.Redis = redis.createClient(_Config.port, _Config.host, _Config.opts);
        _this.Redis.on('redis connect', function(err){
            if(err){
                console.log('1、redis connect', redisUtils.Config.host, err.code);
                callback(err);
                return;
            }
        });
        _this.Redis.on('ready', function(err){
            if(err){
                console.log('2、redis ready', redisUtils.Config.host, err.code);
                _this.Data.IsInit = false;
                callback(err);
                return;
            }
            for(var key in _Config){
                if(key.toLocaleLowerCase() == 'db'){
                    redisUtils.Redis.SELECT(_Config[key]);
                    break;
                }
            }
            _this.Data.IsInit = true;
            callback();
        });
        _this.Redis.on('error', function(err){
            if(err){
                console.log('3、redis error', redisUtils.Config.host, err.code);
                return;
            }
            // callback(err);
            //异常重联...
            setTimeout(_this.Reconnection, 1000);
        });
        _this.Redis.on('end', function(err){
            if(err){
                console.log('4 redis end', redisUtils.Config.host, err.code);
                callback(err);
                return;
            }
            console.log('4 redis end...', redisUtils.Config.host);
        });
    },
    //重联
    Reconnection:function () {
        var _this = redisUtils;
        _this.Init(_Config);
    },
    //
    Keys:function (key, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.keys(key, callback);
    },
    Set:function(key, value, callback){
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.set(key, value, callback);
        redisUtils._AutoClose();
    },
    Get:function (key, callback){
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.get(key, callback);
        redisUtils._AutoClose();
    },
    HmSet:function (hashName, hashValue, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.hmset(hashName, hashValue, callback);
        redisUtils._AutoClose();
    },
    HmGet:function (hashName, keyName, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.hmget(hashName, keyName, callback);
        redisUtils._AutoClose();
    },
    HGetAll:function (hashName, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.hgetall(hashName, callback);
        redisUtils._AutoClose();
    },
    //删除
    HDel:function (hashName, keyName, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.hdel(hashName, keyName, callback);
    },
    Del:function (hashName, callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        _this.Redis.del(hashName, callback);
    },
    //清空
    FlushAll:function(callback){
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        redisUtils.Redis.flushall(callback);
    },
    //清空
    FlushDb:function(callback){
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        redisUtils.Redis.flushdb(console.print);
    },
    //持久化
    BgSave:function (callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        redisUtils.Redis.bgsave();
    },
    _AutoClose:function () {
        // clearTimeout(redisUtils.Data.Temp);
        // redisUtils.Data.Temp = setTimeout(function () {
        //     redisUtils.Redis.quit();
        // },100);
    },
    _Multi:function (callback) {
        var _this = redisUtils;
        if(!_this.Data.IsInit){callback('Redis联机失败'+redisUtils.Config.host);return;}
        var key = 'KeyName';
        _this.Redis.sadd(key, 'C#', 'java', redis.print);
        _this.Redis.sadd(key, 'nodejs');
        _this.Redis.multi()
            .sismember(key, 'C#')
            .smembers(key)
            .exec(function(err, replies){
                console.log('MULTI Got ' + replies.length + ' replies');
                replies.forEach(function(reply, index){
                    console.log('Reply '+index+':'+reply.toString());
                });
                _this.Redis.quit();
            });
        // multi 这个标记一个事务的开始
        // sadd 集合操作，向集合key中添加N个元素，已存在元素的将忽略；
        // sismember 元素value是否存在于集合key中，存在返回1，不存在返回0
        // smembers 返回集合 key 中的所有成员，不存在的集合key也不会报错，而是当作空集返回
        // exec 执行事务内所有命令；github上描述是client.multi()返回一个Multi对象，它包含了所有命令，直到Multi.exec()被调用；
    }
};
