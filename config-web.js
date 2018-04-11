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
                user:"vps_mysql",
                password:"aA123456",
                database:"game_egret"
            }
        },
        RedisDB0:{
            db: 0,
            name: 'db_game',
            port: 6379,
            host: '127.0.0.1',
            opts: {auth_pass:'4dKaVYAKXjN4'}
        }
    },
    //Session
    Session:{
        //系统验证码，存储SESSION中的KEY
        verifiyCode:'verifiyCodeKey',
        //session密钥
        secret:'game_data_qOk3oKfkf8'
    }
};