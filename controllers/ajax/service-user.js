var Config = require('../../config-web.js');
var CommonData = require('../../lib/common-data');
var CommonDataFormat = require('../../lib/common-data-format');
var CommonUtils = require('../../lib/common-utils');
var DalFactory = require('../../lib/dal-factory');

module.exports = {
    Ajax:function (req, res, next) {
        switch (req.params.type) {
            case 'register':
                ajaxFactory.User.UserRegister(req, res, next);
                break;
            case 'login':
                ajaxFactory.User.UserLogin(req, res, next);
                break;

            default:
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.AjaxError) );
        }
    }
};

var ajaxFactory = {
    User:{
        //用户注册
        UserRegister: function (req, res, next) {
            var reqParam = {
                UserName: req.params['f_UserName'] ? req.params['f_UserName'].trim() : '',
                Password: req.params['f_Password'] ? req.params['f_Password'].trim() : '',
                Password2: req.params['f_Password2'] ? req.params['f_Password2'].trim() : '',
                IP: CommonUtils.Common.GetIP(req),
                Act: req.params['f_Act'] ? req.params['f_Act'].trim() : ''
            };
            if(!(reqParam.UserName && reqParam.Password && reqParam.Password2 && reqParam.Act)){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.AjaxParam) );
                return;
            }
            if(reqParam.UserName.length < 5 || reqParam.Password < 5){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.RegUserNamePasswordShort) );
                return;
            }
            if(reqParam.Password != reqParam.Password2){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.RegUserPasswordUnlike) );
                return;
            }
            console.log('>>>', reqParam.Act, reqParam.Act.toLocaleLowerCase(), reqParam.Act.toLocaleLowerCase() == 'reg')
            if(reqParam.Act.toLocaleLowerCase() != 'reg'){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.FormParam) );
                return;
            }
            DalFactory.Mysql.UserRegister(reqParam.UserName, CommonUtils.Common.MD5(reqParam.Password), reqParam.IP, function (data, result) {
                if(data.flag != 0){
                    res.jsonp( data );
                    return;
                }
                res.jsonp( CommonData.NewSuccessFormat() );
            });
        },
        //用户登录
        UserLogin:function (req, res, next) {
            var reqParam = {
                UserName: req.params['f_UserName'] ? req.params['f_UserName'].trim() : '',
                Password: req.params['f_Password'] ? req.params['f_Password'].trim() : '',
                Code: req.params['f_Code'] ? req.params['f_Code'].trim() : '',
                Act: req.params['f_Act'] ? req.params['f_Act'].trim() : '',
                IP: CommonUtils.Common.GetIP(req),
                Session: req.session.id,
                Referer: req.headers['referer'] || '',
                Agent: req.headers["user-agent"]
            };
            if( !(reqParam.UserName && reqParam.Password && reqParam.Code && reqParam.Act) ){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.AjaxParam) );
                return;
            }
            if(4 != reqParam.Code.length){
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.VerifyCode) );
                return;
            }
            if(reqParam.Code != req.session[Config.Session.verifiyCode]){
                // req.session[Config.Session.verifiyCode];
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.VerifyCode) );
                return;
            }
            if(6 > reqParam.UserName.length || 6 > reqParam.Password.length || reqParam.Act != 'login'){
                resultData.msg = '请正确输入表单！';
                res.jsonp( CommonData.NewResultFormat(CommonData.ClientError.FormParam) );
                return;
            }
            //用户密码md5
            reqParam.Password = CommonUtils.Common.MD5(reqParam.Password);
            //数据库验证
            DalFactory.Mysql.UserLogin(reqParam.UserName, reqParam.Password, reqParam.IP, reqParam.Session, reqParam.Referer, reqParam.Agent, function(data, resObj){
                if(data.flag != 0) {
                    res.jsonp( data );
                    return;
                }
                // var sUserInfo = CommonDataFormat.SessionUserInfo();
                req.session.IsAdmin = resObj.user_is_admin;
                req.session.IsLogin = 'true';
                req.session.UserId = resObj.user_id;
                req.session.UserName = resObj.user_name;
                res.jsonp( CommonData.NewSuccessFormat(resObj) );
            });
        },
        //用户信息
        UserInfo:function (req, res, next) {
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                UserId: CommonUtils.Common.String.toInt(req.params['UserId'], -1),
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            DalFactory.UserInfo(parm, function (err, result, fields) {
                if(result[0].user_id){
                    resultData.data.UserInfo = result[0];
                    res.jsonp(resultData);
                    return;
                }
            });
            resultData.msg = CommonData.ClientError.NoUserInfo.Status;
            res.jsonp(resultData);
        },
        //用户列表
        UserList:function (req, res, next) {
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            DalFactory.UserList(parm, function (err, result, fields) {
                if(err){
                    console.log('UserList', err);
                    return;
                }
                resultData.flag = 0;
                resultData.data = {
                    Index: parm.Index,
                    Length: parm.Length,
                    Total: result.Total,
                    List:result.List
                };
                res.jsonp(resultData);
            });
        }
    },
    Room:{
        //房间结果历史列表
        RoomResultHistory:function (req, res, next) {
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                RoomId: req.params['RoomId'] || -1,
                DoneType: req.params['DoneType'] || 'ok',
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            if(parm.RoomId === -1){
                resultData.msg = '缺少参数';
                resultData.RoomId = req.params['RoomId'];
                res.jsonp(resultData);
                return;
            }
            DalFactory.RoomResultHistory(parm, function (err, result, fields) {
                if(err){
                    console.log('RoomResultHistory', err);
                    return;
                }
                resultData.flag = 0;
                resultData.data = {
                    UserInfo:{
                        UserId: parm.UserId
                    },
                    Index: parm.Index,
                    Length: parm.Length,
                    Total: result.Total,
                    History:result.Result
                };
                res.jsonp(resultData);
            });
        },
        //房间结果历史，未读取的。
        RoomResultHistoryIsRead:function (req, res, next){
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                KeyName: req.params['KeyName'] || 'Result_',
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            DalFactory.Redis.RoomResultHistoryIsRead(parm, function (err, result) {
                if(err){
                    console.log('RoomResultHistoryIsRead ClientError:', err);
                    return;
                }
                resultData.flag = 0;
                resultData.data = {
                    Index: parm.Index,
                    Length: parm.Length,
                    CurrTime: CommonUtils.Common.Now(),
                    TotalCount: result.TotalCount,
                    History:result.Result
                };
                res.jsonp(resultData);
            });
        },
        //房间结果历史，到用户详细数据
        RoomResultHistoryToUser:function (req, res, next) {
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                IsUserData: req.params['IsUserData'],
                RoomId: req.params['RoomId'],
                ShowNum: CommonUtils.Common.String.toInt(req.params['ShowNum']),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            DalFactory.RoomResultHistoryToUser(parm, function (err, result, fields) {
                if(err){
                    console.log('RoomResultHistoryToUserData ClientError:', err);
                    return;
                }
                resultData.flag = 0;
                resultData.data = result;
                res.jsonp(resultData);
            });
        },
        //房间路数图 数据补充与修改
        RoomRoadUpdate:function (req, res, next) {
            var resultData = DalFactory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                UserId: req.session.UserId,
                Table: req.params['Table'],
                ShowNum: req.params['ShowNum'],
                Status: req.params['Status'],
                Description: req.params['Description'],
                res_id: req.params['ResId']
            };
            CommonUtils.async.parallel([
                function (next) {
                    DalFactory.UserRoomRoadUpdate({
                        road_user_id: parm.UserId,
                        road_table: parm.Table,
                        road_show_num: parm.ShowNum,
                        road_status: parm.Status,
                        road_description: parm.Description,
                        res_id: parm.res_id
                    }, function (err, result, fields) {
                        if(err){
                            console.log('ajax RoomRoadUpdate mysql UserRoomRoadUpdate ClientError :', err);
                            return;
                        }
                        next();
                    });
                },
                function (next) {
                    //写入 Redis
                    var road = {
                        UserId: parm.UserId,
                        Site: '',
                        Game: '',
                        Table: parm.Table,
                        ShowNum: parm.ShowNum,
                        Status: parm.Status,
                        Description: parm.Description,
                        IsRead: 0,
                        CreateDate: CommonUtils.Common.Now()
                    };
                    DalFactory.Redis.GameRoad('Road_'+road.Table+'_'+road.ShowNum, road, function (err, result) {
                        if(err){
                            console.log('ajax RoomRoadUpdate redis GameRoad ClientError', err);
                            return;
                        }
                        next();
                    });
                }
            ], function (err) {
                if(err){
                    console.log('CommonUtils.async.parallel ClientError:', err);
                    return;
                }
                resultData.flag = 0;
                res.jsonp(resultData);
            });
        }
    }
};