module.exports = {
    //虚拟路径
    VirtualPath:{
        Site:{
            Domain: "127.0.0.1",
            Port: 8001
        },
        Socket:{
            Domain:'127.0.0.1',
            Port:8002
        }
    },
    //数据库
    Db:{
        Mysql:{
            main_db:{
                host:"127.0.0.1",
                user:"数据库帐号",
                password:"数据库密码",
                database:"数据库名称"
            }
        },
        RedisDB0:{
            db: 0,
            name: 'db_game',
            port: 6379,
            host: '127.0.0.1',
            opts: {auth_pass:'密码'}
        }
    },
    //Session
    Session:{
        //系统验证码，存储SESSION中的KEY
        verifiyCode:'verifiyCodeKey',
        //session密钥自己设定
        secret:'123456'
    },
    Cookie:{
        //cookie密钥自己设定
        secret:'123123'
    }
};
