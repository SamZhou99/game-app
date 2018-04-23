var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var Config = require('./config-web');
var DalFactory = require('./lib/dal-factory');
var CommonUtils = require('./lib/common-utils');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//Cookie设置 并 设置
app.use(cookieParser(Config.Cookie.secret));
//Session设置
app.use(session({
    // store: new RedisStore(Config.Redis.Session),
    secret: Config.Session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));
app.use(express.static(path.join(__dirname, 'public')));
//放这里，上一句，静态文件访问不输出log
app.use(logger('dev'));
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

DalFactory.Init(function (data) {
    if(data.flag != 0){
        CommonUtils.Out(data.msg);
        return;
    }
    CommonUtils.Out('DalFactory Init OK!');
}, false);

module.exports = app;
