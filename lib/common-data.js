module.exports = {
    //返回 结果 数据格式
    NewResultFormat: function(resObj){
        if(!resObj){
            throw new Error("ClientError: 数据错误 null 或 undefined");
            return null;
        }
        if(resObj && typeof resObj != 'object'){
            throw new Error("ClientError: 数据类型不正确，");
            return null;
        }
        return {
            flag:   resObj.flag ? resObj.flag : -1,       //初始化默认值 -1默认值 0正确 其他错误,
            msg:    resObj.msg ? resObj.msg : '-',        //消息描述
            data:   resObj.data ? resObj.data : {}        //返回字典数据
        };
    },
    //返回 成功的 数据格式
    NewSuccessFormat: function(data){
        return {
            flag: 0,                //正确
            msg: 'success',         //成功
            data: data ? data : {}  //返回字典数据
        }
    },
    //返回 失败的 数据格式
    NewFailedFormat: function(msg, data){
        return {
            flag: -1,               //错误
            msg: msg,               //失败
            data: data ? data : {}  //返回字典数据
        }
    },
    CommonError: {
        ResultVoid: {
            flag: -1,
            msg: '结果为空'
        },
        ResultNull: {
            flag: -1,
            msg: '结果Null'
        },
        ResultAbnormal: {
            flag: -1,
            msg: '结果异常'
        }
    },
    //客户端错误提示
    ClientError:{
        AjaxError:{
            flag: 100,
            msg: 'AJAX URL 异常请求'
        },
        AjaxParam:{
            flag: 101,
            msg: '缺少参数'
        },
        VerifyCode:{
            flag: 102,
            msg: '请输入正确的验证码'
        },
        FormParam:{
            flag: 103,
            msg: '请输入正确的表单'
        },
        LoginError:{
            flag: 104,
            msg: '登录错误'
        },
        RegUserRepeatError:{
            flag: 105,
            msg: '该用户重复，注册失败'
        },
        RegUserPasswordUnlike:{
            flag: 106,
            msg: '两次输入的密码不一致'
        },
        RegUserNamePasswordShort:{
            flag: 107,
            msg: '用户名或密码太短，需要满足6位或以上'
        },
        RegUserRepeatIPError:{
            flag: 108,
            msg: '同IP用户，短时间内，重复注册'
        },

        NoLogin:{
            Status: 101,
            Description: '未登录'
        },
        NoUserInfo: {
            Status: 102,
            Description: '没有该用户信息'
        },
        NoJoinRoom: {
            Status: 103,
            Description: '您尚未进入房间'
        },
        LimitedAuthority: {
            Status: 104,
            Description: '权限不够'
        }
    },
    //数据层错误
    DalError:{
        RedisInitError:{
            flag: 801,
            msg: 'redis init error'
        },

        MysqlInitError:{
            flag: 901,
            msg: 'mysql init error'
        },
        MysqlError:{
            flag: 902,
            msg: 'sql 执行错误'
        },
        MysqlSessionUserInfoError:{
            flag: 903,
            msg: '获取用户Session信息sql错误'
        },
        MysqlUserLoginError:{
            flag: 904,
            msg: '查询不到该用户信息'
        },
        MysqlUserLoginAddInfoError:{
            flag: 905,
            msg: '添加用户登录信息错误'
        }
    }
};