$(function () {
    var testVue = new Vue({
        el: '#appTest',
        data: {
            sending: false,
            tip: 'Loading...',
            msg: [],
            data: {}
        },
        methods:{
            onLogout:function (e) {
                if(testVue.sending) return;
                testVue.sending = true;
                $.getJSON('/ajax/user/logout', function(result){
                    testVue.sending = false;
                    if(result.flag != 0){
                        testVue.tip = [result.flag, result.msg].toString();
                        return;
                    }
                    testVue.tip = '登出成功';
                    window.document.location = '/login';
                });
            }
        }
    });
    var This = {
        Io: null,
        Init: function () {
            This.Io = io('http://'+_PageData.VirtualPath.Socket.Domain+':'+_PageData.VirtualPath.Socket.Port+'/room');
            This.Io.on('connect', function () {
                testVue.tip = '联机成功';
                testVue.data = _PageData.UserInfo;
            });
            This.Io.on('disconnect', function (data) {
                testVue.tip = '联机断开';
                window.document.location = '/login';
            });
        }
    };
    This.Init();
});