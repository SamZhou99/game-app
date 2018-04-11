var DataFormat = {
    SessionUserInfo: function () {
        return {
            IsLogin: false,
            IsAdmin: false,
            UserId: '',
            UserName: ''
        };
    },
    UserInfo:function () {
        return {
            UserId: null,
            UserName: null,
            IsAdmin: false,
            Session: null,
            IP: null
        };
    },
    RoomInfo:function(){
        return {
            RoomId: null
        };
    }
};

module.exports = DataFormat;