var Config = require('../../config-web');
var CommonData = require('../../lib/common-data');
var CommonUtils = require('../../lib/common-utils');
var DalFactory = require('../../lib/dal-factory');

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
            }
            if(data.UserInfo.IsLogin == 'true'){
                data.GameRoom = CommonData.GameRoom;
                data.GameRoad = CommonData.GameRoad;
            }
            return data;
        },
    },
    //首页
    Index: function (req, res) {
        var pageData = PageFactory.Common.GetPageData(req);
        res.render('index', {
            Title: '游戏',
            Content: 'content html',
            PageData: JSON.stringify(pageData)
        });
    },
    //登入
    Login: function (req, res) {
        if(CommonUtils.Common.CheckLogin(req, res)){
            res.redirect('/');
            return;
        }
        var pageData = PageFactory.Common.GetPageData(req);
        res.render('login', {
            Title: '登录',
            Content: 'html',
            PageData: JSON.stringify(pageData)
        });
    },
    //登出
    Logout: function (req, res) {
        if(!CommonUtils.Common.CheckLogin(req, res)){
            req.session.IsLogin = false;
            req.session.IsAdmin = false;
            req.session.UserId = null;
            req.session.UserName = null;
        }
        res.redirect('/login');
    }
};