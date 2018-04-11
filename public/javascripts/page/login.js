$(function () {
    var testVue = new Vue({
        el: '#appTest',
        data: {
            tip: '登录',
            sending: false
        },
        methods: {
            onClickEnterBtn: function () {
                if(testVue.sending) return;
                var reqData = {
                    f_UserName: $('#f_UserName').val(),
                    f_Password: $('#f_UserPassword').val(),
                    f_Code: $('#f_Code').val(),
                    f_Act: 'login'
                };
                if( !(reqData.f_UserName && reqData.f_Password && reqData.f_Code) ){
                    testVue.tip = '请正确填写表单，再登录提交！';
                    return;
                }
                testVue.tip = '正在提交...';
                testVue.sending = true;
                $.getJSON('/ajax/user/login', reqData, function(result){
                    testVue.sending = false;
                    if(result.flag != 0){
                        testVue.tip = [result.flag, result.msg].toString();
                        return;
                    }
                    testVue.tip = '登录成功';
                    window.document.location = '/';
                });
            },
            onClickChangeImg: function () {
                $('#f_CodeImg').attr('src', '/verifiyCode?r='+Math.random());
            }
        }
    });
});