var CommonData = require('./common-data');
var CommonDataFormat = require('./common-data-format');
var CommonUtils = require('./common-utils');
var DalFactory = require('./dal-factory');

var This = {
    //获取Session
    GetSession: function(socket) {
        //CommonUtils.Out('IP:', socket.request.connection.remoteAddress, socket.request.headers.cookie);
        var Cookie = CommonUtils.Common.Cookie.GetObj(socket.request.headers.cookie);
        if( !(Cookie!=null && Cookie['connect.sid']!=undefined) ){
            return null;
        }
        var sessionId = CommonUtils.Common.Session.GetId(Cookie);
        if(!sessionId){
            return null;
        }
        return sessionId;
    },
    //验证Session
    VerifySession: function (socket, sessionId, callback) {
        DalFactory.Mysql.SessionId_GetUserInfo(sessionId, function (data) {
            callback( data );
        });
    }
};
var ServerUserList = {
    //所有总人数
    TotalCount:0,
    //用户数据
    Users:{},
    //添加用户
    AddItem:function (RoomId, UserInfo) {
        if(!ServerUserList.Users[RoomId]){
            ServerUserList.Users[RoomId] = [];
        }
        ServerUserList.Users[RoomId].push(UserInfo);
        ServerUserList.TotalCount++;
        return true;
    },
    //删除用户
    RemoveItem:function (RoomId, UserInfo) {
        var Room = ServerUserList.Users[RoomId];
        if(!Room) return false;
        for(var userIndex in Room){
            var userValue = Room[userIndex];
            if(userValue.UserId == UserInfo.UserId){
                ServerUserList.Users[RoomId][userIndex] = null;
                ServerUserList.Users[RoomId].splice(userIndex, 1);
                ServerUserList.TotalCount--;
                return true;
            }
        }
        return false;
    },
    //检查是否有重复用户
    CheckItemYes:function (RoomId, UserInfo) {
        var clients = ServerUserList.Clients(RoomId);
        var prevUserInfo = CommonUtils.lodash.filter(clients, function (item) {
            return (item.UserId == UserInfo.UserId) ? item : null;
        });
        if(prevUserInfo.length > 0){
            var socketId = String(prevUserInfo[0].Sockets.id).replace('_','/').replace('_','#');
            ServerSocket.Socket.Emit.CloseUserConnect(RoomId, socketId, prevUserInfo[0]);
            return true;
        }
        return false;
    },
    //房间所有用户
    Clients:function (RoomId) {
        if(!ServerUserList.Users[RoomId]) return null;
        return ServerUserList.Users[RoomId];
    },
    //所有房间 所有用户
    AllRoomsClients:function () {
        var a = [];
        for(var RoomId in ServerUserList.Users){
            a.push(ServerUserList.Users[RoomId]);
        }
        return a;
    },


    /******************************
     *          额外的方法
     *****************************/


    //获取少量的用户信息
    GetUserInfoSmall:function (UserInfo) {
        return UserInfo;
    },
    //获取房间用户 少量的信息
    GetClientsSmall:function (RoomId) {
        if(!ServerUserList.Users[RoomId]) return null;
        var list = [];
        for(var i=0; i<ServerUserList.Users[RoomId].length; i++){
            var userInfo = ServerUserList.Users[RoomId][i];
            if(userInfo.IsAdmin == 0){
                list.push(ServerUserList.GetUserInfoSmall(userInfo));
            }
        }
        return list;
    }
};
var ServerRoomList = {
    //房间数据。
    Rooms:{},
    //添加房间
    AddItem:function (RoomId, RoomInfo) {
        if(ServerRoomList.Rooms[RoomId]){
            return false;
        }
        ServerRoomList.Rooms[RoomId] = RoomInfo;
        return true;
    },
    //删除房间
    RemoveItem:function (RoomId) {
        if(ServerRoomList.Rooms[RoomId]){
            ServerRoomList.Rooms[RoomId] = null;
            delete ServerRoomList.Rooms[RoomId];
            return true;
        }
        return false;
    },
    //获取房间
    GetItem:function (RoomId) {
        return ServerRoomList.Rooms[RoomId];
    }
    //房间列表 格式 Object
    // Rooms:{
    //     //RoomId KeyName
    //     RoomId:[
    //         //RoomInfo Object
    //         {
    //             Site: null,
    //             Game: null,
    //             RoomId: null,
    //             Operator: null
    //         }
    //     ]
    // },
};
var ServerSocket = {
    IO: null,
    Init:function (io) {
        this.IO = io.of("/room");
        this.IO.on('connection', function(socket){
            var sessionId = This.GetSession(socket);
            if(!sessionId){
                CommonUtils.Out('sessionId : null（有可能非法联机）');
                socket.disconnect();
                return;
            }
            This.VerifySession(socket, sessionId, function (data) {
                if(data.flag != 0){
                    CommonUtils.Out('ClientError VerifySession : ', data);
                    socket.disconnect();
                    return;
                }
                if(!data.data){
                    socket.disconnect();
                    CommonUtils.Out( CommonData.CommonError.ResultNull );
                    return;
                }
                if(data.data.length <= 0){
                    socket.disconnect();
                    CommonUtils.Out( CommonData.CommonError.ResultVoid );
                    return;
                }
                if(data.data.length >= 2){
                    socket.disconnect();
                    CommonUtils.Out( CommonData.CommonError.ResultAbnormal );
                    return;
                }
                if(!data.data[0]){
                    socket.disconnect();
                    CommonUtils.Out( CommonData.CommonError.ResultVoid );
                    return;
                }
                if(!data.data[0].user_id){
                    socket.disconnect();
                    CommonUtils.Out( CommonData.CommonError.ResultVoid );
                    return;
                }
                ServerSocket.Socket.InitEvent(socket, sessionId, data.data[0]);
            });
        });
    },
    Socket: {
        InitEvent: function (socket, sessionId, result) {
            var UserInfo = CommonDataFormat.UserInfo();
            UserInfo.UserId = result.user_id;
            UserInfo.UserName = result.user_name;
            UserInfo.IsAdmin = result.user_is_admin;
            UserInfo.SessionId = sessionId;
            UserInfo.Sockets = {
                id: String(socket.id).replace('/','_').replace('#','_'),
                type: 'PC'
            };
            UserInfo.IP = socket.handshake.address || '-';
            var RoomInfo;
            /***************************************
             * 进入房间
             ***************************************/
            socket.on('Join', function (parm) {
                RoomInfo = CommonDataFormat.RoomInfo();
                RoomInfo.RoomId = parm.RoomInfo.RoomId;
                //进入房间 检查重复 ID
                ServerUserList.CheckItemYes(RoomInfo.RoomId, UserInfo);
                //进入房间 创建房间数据
                ServerRoomList.AddItem(RoomInfo.RoomId, RoomInfo);
                //进入房间 加入用户列表
                ServerUserList.AddItem(RoomInfo.RoomId, UserInfo);
                //加入Socket列表
                socket.join(RoomInfo.RoomId.toString()).RoomId = RoomInfo.RoomId;
                //通知自己进入
                socket.emit("Join", {
                    flag: 0,
                    message: "",
                    data: {
                        UserInfo: ServerUserList.GetUserInfoSmall(UserInfo),
                        RoomInfo: RoomInfo,
                        GameInfo: ServerGameInfo.GetGameTimeData(RoomInfo.RoomId),
                        //获取 当前场次 操作员提交几条结果数据
                        ResultNum: ServerGameInfo.GetResultNum(RoomInfo.RoomId, ServerGameInfo.GetGameTimeData(RoomInfo.RoomId).ShowNum),
                        CreateDate: new Date()
                    }
                });
                //管理员 不算进入房间
                if(UserInfo.IsAdmin == 1) return;
                //广播给其他用户
                socket.in(RoomInfo.RoomId).emit("JoinBroadcast", {
                    RoomUserInfo: ServerUserList.GetUserInfoSmall(UserInfo),
                    RoomInfo: RoomInfo,
                    GameInfo: ServerGameInfo.GetGameTimeData(RoomInfo.RoomId),
                    CreateDate: new Date()
                });
                CommonUtils.Out('>>>>>>>>>>>>>>>>>>>>  Join  >>>>>>>>>>>>>>>>>>>>>>>');
                CommonUtils.Out('UserInfo:'+UserInfo.UserId, UserInfo.UserName);
                CommonUtils.Out('RoomId:'+RoomInfo.RoomId);
                CommonUtils.Out('RoomClientCount:'+ServerUserList.Clients(RoomInfo.RoomId).length);
                CommonUtils.Out('\n');
            });
            /***************************************
             * 获取房间用户列表
             ***************************************/
            socket.on('GetRoomUserList', function (parm) {
                var reqData = {
                    RoomId: parm.RoomId
                };
                var resData = {
                    RoomInfo:{
                        RoomId: reqData.RoomId
                    },
                    UserList: ServerUserList.GetClientsSmall(reqData.RoomId),
                    TotalCount: ServerUserList.TotalCount,
                    CreateDate: new Date()
                };
                socket.emit("GetRoomUserList", CommonData.NewSuccessFormat(resData));
            });

            /***************************************
             * 离开
             ***************************************/
            socket.on('disconnect', function () {
                if(!RoomInfo || !UserInfo){
                    //CommonUtils.Out('Socket断开...', socket.id);
                    return;
                }
                if(!ServerUserList.RemoveItem(RoomInfo.RoomId, UserInfo)) return;

                var len = ServerUserList.Clients(RoomInfo.RoomId).length;
                if(len <= 0){
                    //建议 没人后，延迟清除数据（以防刷新造成频繁 清队创建数据）
                    ServerGameInfo.RemoveGameTimeData(RoomInfo.RoomId);
                    ServerRoomList.RemoveItem(RoomInfo.RoomId);
                    ServerRoomStatus.RemoveItem(RoomInfo.RoomId);
                }
                CommonUtils.Out('<<<<<<<<<<<<<<<<<<<<  Leave  <<<<<<<<<<<<<<<<<<<<<<<');
                CommonUtils.Out('UserInfo:' + UserInfo.UserId, UserInfo.UserName);
                CommonUtils.Out('RoomId:' + RoomInfo.RoomId);
                CommonUtils.Out('RoomClientCount:' + ServerUserList.Clients(RoomInfo.RoomId).length);
                CommonUtils.Out('\n');
                socket.in(RoomInfo.RoomId).emit("LeaveBroadcast", {
                    RoomUserInfo: {
                        UserId: UserInfo.UserId,
                        UserName: UserInfo.UserName,
                        Sockets: UserInfo.Sockets
                    },
                    RoomInfo: {
                        RoomId: RoomInfo.RoomId,
                        Operator: RoomInfo.Operator
                    },
                    CreateDate: CommonUtils.Common.Now()
                });
                UserInfo = null;
                RoomInfo = null;
            });
            /***************************************
             * 测试用
             ***************************************/
            socket.on('Test', function () {
                CommonUtils.Out('Test ServerGameInfo.Result : ');
            });
        },
        Emit:{
            CloseUserConnect:function (RoomId, socketId, prevUserInfo) {
                ServerSocket.IO.in(RoomId).to(socketId).emit('Close', {
                    Msg:'重复进入',
                    UserInfo:{
                        UserId: prevUserInfo.UserId,
                        UserName: prevUserInfo.UserName,
                        IsAdmin: prevUserInfo.IsAdmin,
                        IP: prevUserInfo.IP
                    }
                });
            }
        }
    }
};
module.exports = ServerSocket;

//推送类型
// socket.emit('') //推送给自己
// socket.in(socket.RoomId.toString()).emit('') //推送给房间其他用户，不包括自己
// SocketIO.Room.in(socket.RoomId).emit('') //推送给房间用户，包括自己
// SocketIO.Room.emit('') //推送全服
// console.log('socket connect...', socket.id);
// console.log('socket cookie...', socket.request.headers.cookie);
// console.log('Cookie 结果1', Cookie);
// console.log('Cookie 结果2', Cookie['io']);
// console.log('Cookie 结果3', Cookie['connect.sid']);
