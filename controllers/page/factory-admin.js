var Config = require('../../config');
var CommonData = require('../../lib/CommonData');
var CommonUtils = require('../../lib/CommonUtils');
var DAL_Factory = require('../../lib/dal/dal-factory');

var PageFactory = module.exports = {
    Common:{
        //页面数据
        GetPageData:function (req) {
            var data = {
                IsMobile: req.headers["user-agent"].toLowerCase().indexOf("mobile") != -1,
                VirtualPath: Config.VirtualPath,
                UserInfo:{}
            };
            data.UserInfo.IsLogin = req.session.IsLogin || 'false';
            if(req.session.UserId){
                data.UserInfo.UserId = req.session.UserId;
            }
            if(req.session.UserName){
                data.UserInfo.UserName = req.session.UserName;
            }
            if(req.session.IsAdmin){
                data.UserInfo.IsAdmin = req.session.IsAdmin == 1;
                console.log('data.UserInfo.IsAdmin = ', data.UserInfo.IsAdmin);
            }
            if(data.UserInfo.IsLogin == 'true'){
                data.GameRoom = CommonData.GameRoom;
                data.GameRoad = CommonData.GameRoad;
            }
            return data;
        },
        //脚本数据
        GetJSData:function () {
            return {
            };
        }
    },
    PageUser:{
        //首页
        Index:function (req, res) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            res.render("index-content", function (req, html) {
                res.render("index", {
                    Title: "请选择游戏平台",
                    content: 'content html',
                    isMobile: pagedata.IsMobile,
                    pagedata: JSON.stringify(pagedata),
                    scriptdata: JSON.stringify(scriptdata)
                });
            });
        },
        //登入
        UserLogin:function (req, res, next) {
            if(CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            // CommonUtils.Common.Out('UserLogin============================>>>');
            // CommonUtils.Common.Out('session', req.session.id);
            // CommonUtils.Common.Out('cookie', req.cookie);
            req.session.IsLogin = false;
            res.render('login', {
                Title:'登录',
                content:'',
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        },
        //登出
        UserLogout:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            if(CommonUtils.Common.CheckLogin(req, res)){
                var pram = {
                    user_id: req.session.UserId,
                    session_id: req.session.id
                };
                DAL_Factory.UserLogoutRemoveLog(pram, function (err) {
                    if(err){
                        resultData.msg = err.toString();
                        res.jsonp(resultData);
                        return;
                    }
                    req.session.IsLogin = 'false';
                    req.session.UserId = null;
                    req.session.UserName = null;
                    req.session.IsAdmin = null;
                    res.redirect('/login');
                });
                return ;
            }

            res.redirect('/login');
        },
        //录入数据
        InputRecord:function (req, res, next) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            var templateName = pagedata.IsMobile ? 'mobile' : 'pc';

            if(req.params['Game'] && req.params['Game'].indexOf('百家乐') != -1){
                res.render('game/'+templateName+'/baccarat', {
                    Title:'百家乐',
                    isMobile: pagedata.IsMobile,
                    pagedata:JSON.stringify(pagedata),
                    scriptdata:JSON.stringify(scriptdata)
                });
                return;
            }
            else if(req.params['Game'] && req.params['Game'].indexOf('牛牛') != -1){
                res.render('game/'+templateName+'/niuniu', {
                    Title:'牛牛',
                    isMobile: pagedata.IsMobile,
                    pagedata:JSON.stringify(pagedata),
                    scriptdata:JSON.stringify(scriptdata)
                });
                return;
            }
            else if(req.params['Game'] && req.params['Game'].indexOf('龙虎') != -1){
                res.render('game/'+templateName+'/longhu', {
                    Title:'龙虎斗',
                    isMobile: pagedata.IsMobile,
                    pagedata:JSON.stringify(pagedata),
                    scriptdata:JSON.stringify(scriptdata)
                });
                return;
            }
            else if(req.params['Game'] && req.params['Game'].indexOf('炸金花') != -1){
                res.render('game/'+templateName+'/zhajinhua', {
                    Title:'炸金花',
                    isMobile: pagedata.IsMobile,
                    pagedata:JSON.stringify(pagedata),
                    scriptdata:JSON.stringify(scriptdata)
                });
                return;
            }
            res.render('game/void', {
                Title:req.params['Game'],
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        },
        //查看房间日志
        ViewLogRoom:function (req, res, next) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();

            res.render('log/room', {
                Title:req.params['Table'],
                RoomId: req.params['Table'],
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        },
        //查看房间列表
        ViewRoomList:function (req, res, next) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();

            res.render('log/room-list', {
                Title:'房间列表',
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        },
        //查看用户日志
        ViewLogUser:function (req, res, next) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();

            res.render('log/user', {
                Title:req.params['UserId'],
                UserId:req.params['UserId'],
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        },
        //查看用户列表
        ViewUserList:function (req, res, next) {
            if(!CommonUtils.Common.CheckLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();

            res.render('log/user-list', {
                Title:'用户列表',
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata)
            });
        }
    },
    PageAdmin:{
        //会员管理,增,删,查,改
        Member:function (req, res, next) {
            if(!CommonUtils.Common.CheckAdminLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();

            res.render('member/member-list', {
                Title:'用户列表',
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata),
                UserId: req.session.UserId,
                Act: req.params['Act'] || 'list'
            });
        },
        //查看Mysql数据库
        ViewDataMysql:function(req, res){
            if(!CommonUtils.Common.CheckAdminLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            if(req.params['TableName'] && req.params['RoomId'] && req.params['ShowNum']){
                DAL_Factory.ViewDataMysql(req.params['TableName'],req.params['RoomId'],req.params['ShowNum'],function (err, result) {
                    if(err){
                        console.log('错误：', err);
                        res.jsonp(err);
                        return;
                    }
                    res.jsonp(result);
                });
                return;
            }
            res.send('缺少参数1');
        },
        //查看Redis数据
        ViewDataRedis:function(req, res){
            if(!CommonUtils.Common.CheckAdminLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            if(req.params['KeyName']){
                DAL_Factory.Redis.ViewDataRedis({
                    KeyType: req.params['KeyType'] || '-',
                    KeyName: req.params['KeyName']
                }, function (err, result) {
                    if(err){
                        console.log('错误：', err);
                        res.jsonp(err);
                        return;
                    }
                    res.send(result);
                });
                return;
            }
            res.send('缺少参数1');
        },
        //清除 残留 redis 数据
        ClearDataRedis:function (req, res) {
            if(!CommonUtils.Common.CheckAdminLogin(req, res)){
                res.redirect('/login');
                return;
            }
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            if(req.params['act'] == 'clear'){
                DAL_Factory.Redis.DeleteGameAndResultData2(function () {
                    res.send('Hello ok');
                });
                return;
            }
            res.send('hi');
        },
        //test session
        TestSession:function (req, res) {
            var pagedata = PageFactory.Common.GetPageData(req);
            var scriptdata = PageFactory.Common.GetJSData();
            req.session.IsLogin = false;
            var str = 'Session: ID='+req.session.id;
            res.render('test-session', {
                Title:'测试Session',
                isMobile: pagedata.IsMobile,
                pagedata:JSON.stringify(pagedata),
                scriptdata:JSON.stringify(scriptdata),
                session_id: req.session.id,
                sessionID: req.sessionID
            });
        }
    }
};