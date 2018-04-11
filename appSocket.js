var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Config = require('./config-web.js');
var CommonUtils = require('./lib/common-utils');

app.get("/", function(req,res){
    res.send("<h1>socket.io</h1>");
});
http.listen(Config.VirtualPath.Socket.Port,function(){
    console.log('==========================');
    console.log('Socket服务已启动端口：' + Config.VirtualPath.Socket.Port);
    console.log('==========================');
});


//初始化 数据
var DalFactory = require('./lib/dal-factory');
DalFactory.Init(function (errObj) {
    if(errObj.flag != 0){
        CommonUtils.Out('DalFactory 初始化失败! ', errObj);
        return;
    }
    CommonUtils.Out('DalFactory 初始化成功！');
    //初始化 Socket 服务
    var ServiceSocket = require('./lib/service-socket').Init(io);
    // //初始化 定时任务
    // var ServiceTask = require('./lib/service-task');
}, false);
// module.exports = app;







