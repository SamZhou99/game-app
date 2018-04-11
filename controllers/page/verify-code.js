var CaptchaPng = require('captchapng');
var Config = require('../../config-web.js');

function getRandom() {
    return String(Math.floor(1000 + 8999 * Math.random()));
}

function imgBase64(randomCode) {
    var png = new CaptchaPng(80, 30, randomCode); //宽, 高, 四位数 的 随机数
    png.color(255, 255, 255, 255);  // 背景色 (red, green, blue, alpha)
    png.color(80, 80, 80, 255); // 字体色 (red, green, blue, alpha)
    var img = png.getBase64();
    return new Buffer(img,'base64');
}

function GetImg(req, res, next) {
    var randomCode = getRandom();
    var img = imgBase64(randomCode);
    req.session[Config.Session.verifiyCode] = randomCode;
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(img);
}

module.exports = {
    GetImg:GetImg
};

