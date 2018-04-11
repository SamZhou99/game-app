var express = require('express');
var router = express.Router();
var CommonUtils = require('../lib/common-utils');
var PAU = require('../controllers/ajax/service-user');
var PAA = require('../controllers/ajax/service-admin');
var PF = require('../controllers/page/factory-user');
var PV = require('../controllers/page/verify-code');

//首页
router.get('/', CommonUtils.Common.RequestExtend, PF.Index);
router.get('/login', CommonUtils.Common.RequestExtend, PF.Login);
router.get('/logout', CommonUtils.Common.RequestExtend, PF.Logout);
//Ajax
router.get('/ajax/user/:type', CommonUtils.Common.RequestExtend, PAU.Ajax);
router.get('/ajax/admin/:type', CommonUtils.Common.RequestExtend, PAA.Ajax);

//验证码
router.get('/verifiyCode', CommonUtils.Common.RequestExtend, PV.GetImg);

module.exports = router;
