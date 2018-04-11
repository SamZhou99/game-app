var Config = require('../../config-web');
var CommonData = require('../../lib/common-data');
var CommonUtils = require('../../lib/common-utils');
var DAL_Factory = require('../../lib/dal-factory');

module.exports = {
    Ajax:function (req, res, next) {
        switch (req.params.type) {
            case 'user.list':
                ajaxFactory.Admin.UserList(req, res, next);
                return;
            case 'room.list':
                ajaxFactory.Admin.RoomList(req, res, next);
                return;
            case 'user.add':
                ajaxFactory.Admin.UserAdd(req, res, next);
                return;
            case 'user.update':
                ajaxFactory.Admin.UserUpdate(req, res, next);
                return;
            case 'user.del':
                ajaxFactory.Admin.UserDel(req, res, next);
                return;
        }
        res.jsonp({flag: -9999, msg: "未知的请求"});
    }
};

var ajaxFactory = {
    User:{
        //用户登录
        UserLogin:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            var parm = {
                UserName: req.params['f_UserName'] ? req.params['f_UserName'].trim() : '',
                Password: req.params['f_Password'] ? req.params['f_Password'].trim() : '',
                Code: req.params['f_Code'] ? req.params['f_Code'].trim() : '',
                Act: req.params['f_Act'] ? req.params['f_Act'].trim() : '',
                IP: CommonUtils.Common.GetIP(req),
                Session: req.session.id,
                Referer: req.headers['referer'],
                Agent: req.headers["user-agent"]
            };
            if( !(parm.UserName && parm.Password && parm.Code && parm.Act) ){
                resultData.msg = '缺少参数！';
                res.jsonp(resultData);
                return;
            }
            if(4 > parm.Code.length){
                resultData.msg = '请输入完整的验证码！1';
                res.jsonp(resultData);
                return;
            }
            if(parm.Code != req.session[Config.Session.verifiyCode.session_key]){
                resultData.msg = '请输入正确的验证码！2 ';//+req.session[Config.Session.verifiyCode.session_key]
                res.jsonp(resultData);
                return;
            }
            if(6 > parm.UserName.length || 6 > parm.Password.length || parm.Act != 'login'){
                resultData.msg = '请正确输入表单！';
                res.jsonp(resultData);
                return;
            }
            //用户密码md5
            parm.Password = CommonUtils.Common.MD5(parm.Password);
            //数据库验证
            DAL_Factory.UserLogin(parm, function(err, result){
                if(err) {
                    console.log('user.login mysql error : ', err);
                    resultData.msg = 'user.login : '+err.code;
                    res.jsonp(resultData);
                    return;
                }
                if(result.flag == -1){
                    res.jsonp(result);
                    return;
                }
                req.session.IsLogin = 'true';
                req.session.UserId = result.data.user_id;
                req.session.UserName = result.data.user_name;
                req.session.IsAdmin = result.data.user_is_admin;
                res.jsonp(result);
            });
        },
        //用户登录历史列表
        UserLoginViewLog:function (req, res, next) {
            var parm = {
                user_id: CommonUtils.Common.String.toInt(req.params['UserId'], -1),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            var resultData = DAL_Factory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            if(parm.user_id == -1){
                resultData.msg = '缺少参数';
                res.jsonp(resultData);
                return;
            }
            DAL_Factory.UserLoginViewLog(parm, function (err, result) {
                if(err){
                    resultData.msg = err.toString();
                    res.jsonp(resultData);
                    return ;
                }
                resultData.flag = 0;
                resultData.data = result;
                res.jsonp(resultData);
            });
        },
        //用户录入历史列表
        UserRecordHistory:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
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
            if(parm.UserId === -1){
                resultData.msg = '缺少参数';
                res.jsonp(resultData);
                return;
            }
            DAL_Factory.UserRecordHistory(parm, function (err, result, fields) {
                if(err){
                    console.log('UserRecordHistory', err);
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
        //用户录入历史列表 正确率
        UserRecordHistoryRight:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                UserId: CommonUtils.Common.String.toInt(req.params['UserId'], -1),
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5),
                StartTime: req.params['StartTime'] || '2017-09-01 10:00:00',
                EndTime: req.params['EndTime'] || '2017-09-01 10:15:00'
            };
            if(parm.UserId === -1){
                resultData.msg = '缺少参数';
                res.jsonp(resultData);
                return;
            }
            DAL_Factory.UserRecordHistoryRight(parm, function (err, result, fields) {
                if(err){
                    console.log('UserRecordHistory', err);
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
                    Pct: result.Pct,
                    Right: result.Right,
                    Len: result.Len,
                    History:result.Result
                };
                res.jsonp(resultData);
            });
        },
        //用户信息
        UserInfo:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
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
            DAL_Factory.UserInfo(parm, function (err, result, fields) {
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
            var resultData = DAL_Factory.Common.NewResultFormat();
            if(!CommonUtils.Common.CheckLogin(req, res)){
                resultData.msg = '未登录';
                res.jsonp(resultData);
                return;
            }
            var parm = {
                Index: CommonUtils.Common.String.toInt(req.params['Index'], 0),
                Length: CommonUtils.Common.String.toInt(req.params['Length'], 5)
            };
            DAL_Factory.UserList(parm, function (err, result, fields) {
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
            var resultData = DAL_Factory.Common.NewResultFormat();
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
            DAL_Factory.RoomResultHistory(parm, function (err, result, fields) {
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
            var resultData = DAL_Factory.Common.NewResultFormat();
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
            DAL_Factory.Redis.RoomResultHistoryIsRead(parm, function (err, result) {
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
            var resultData = DAL_Factory.Common.NewResultFormat();
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
            DAL_Factory.RoomResultHistoryToUser(parm, function (err, result, fields) {
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
            var resultData = DAL_Factory.Common.NewResultFormat();
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
                    DAL_Factory.UserRoomRoadUpdate({
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
                    DAL_Factory.Redis.GameRoad('Road_'+road.Table+'_'+road.ShowNum, road, function (err, result) {
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
    },
    Admin:{
        //用户信息
        UserInfo:function () {

        },
        //用户列表
        UserList:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            resultData.msg = '无参数';
            res.jsonp(resultData);
        },
        //房间信息
        RoomInfo:function () {
            var resultData = DAL_Factory.Common.NewResultFormat();
            resultData.msg = '无参数';
            res.jsonp(resultData);
        },
        //房间列表
        RoomList:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            resultData.msg = '无参数';
            res.jsonp(resultData);
        },
        //添加用户
        UserAdd:function(req, res, next){
            var resultData = DAL_Factory.Common.NewResultFormat();
            var parm = {
                user_name: req.params['f_UserName'] ? req.params['f_UserName'].trim() : '',
                user_password: req.params['f_Password'] ? req.params['f_Password'].trim() : '',
                user_is_admin: req.params['f_UserType'] ? req.params['f_UserType'].trim() : '',
                act: req.params['f_Act'] ? req.params['f_Act'] : ''
            };
            if(!parm.user_name){
                resultData.msg = '缺少参数1';
                res.jsonp(resultData);
                return;
            }
            if(!parm.user_password){
                resultData.msg = '缺少参数2';
                res.jsonp(resultData);
                return;
            }
            if(!parm.user_is_admin){
                resultData.msg = '缺少参数3';
                res.jsonp(resultData);
                return;
            }
            if(parm.act != 'add'){
                resultData.msg = '参数错误1';
                res.jsonp(resultData);
                return;
            }
            parm.user_password = CommonUtils.Common.MD5(parm.user_password);
            DAL_Factory.UserAdd(parm, function (err) {
                if(err){
                    resultData.msg = err.msg;
                    res.jsonp(resultData);
                    return;
                }
                resultData.flag = 0;
                resultData.msg = '帐号添加成功';
                res.jsonp(resultData);
            });
        },
        //更新用户密码
        UserUpdate:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            var parm = {
                user_id: req.params['f_UserId'] ? req.params['f_UserId'].trim() : '',
                user_name: req.params['f_UserName'] ? req.params['f_UserName'].trim() : '',
                user_password: req.params['f_Password'] ? req.params['f_Password'].trim() : '',
                user_is_admin: req.params['f_UserType'] ? req.params['f_UserType'].trim() : '',
                act: req.params['f_Act'] ? req.params['f_Act'].trim() : ''
            };
            if(!parm.user_id){
                resultData.msg = '缺少参数1';
                res.jsonp(resultData);
                return;
            }
            if(!parm.user_name){
                resultData.msg = '缺少参数2';
                res.jsonp(resultData);
                return;
            }
            if(!parm.user_password){
                resultData.msg = '缺少参数3';
                res.jsonp(resultData);
                return;
            }
            if(!parm.user_is_admin){
                resultData.msg = '缺少参数4';
                res.jsonp(resultData);
                return;
            }
            if(parm.act != 'update'){
                resultData.msg = '参数错误1';
                res.jsonp(resultData);
                return;
            }
            parm.user_password = CommonUtils.Common.MD5(parm.user_password);
            DAL_Factory.UserUpdate(parm, function (err) {
                if(err){
                    resultData.msg = err.msg;
                    res.jsonp(resultData);
                    return;
                }
                resultData.flag = 0;
                resultData.msg = '修改成功';
                res.jsonp(resultData);
            });
        },
        //删除用户
        UserDel:function (req, res, next) {
            var resultData = DAL_Factory.Common.NewResultFormat();
            var parm = {
                user_id: CommonUtils.Common.String.toInt(req.params['f_UserId'],0),
                act: req.params['f_Act'] || ''
            };
            if(!parm.user_id){
                resultData.msg = '缺少参数1';
                res.jsonp(resultData);
                return;
            }
            if(parm.act != 'del'){
                resultData.msg = '参数错误1';
                res.jsonp(resultData);
                return;
            }
            DAL_Factory.UserDel(parm, function (err) {
                if(err){
                    resultData.msg = err.msg;
                    res.jsonp(resultData);
                    return;
                }
                resultData.flag = 0;
                resultData.msg = '删除成功';
                res.jsonp(resultData);
            });
        }
    }
};