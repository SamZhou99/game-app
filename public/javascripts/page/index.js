$(function () {
    var testVue = new Vue({
        el: '#appTest',
        data: {
            tip: 'Loading...',
            msg: []
        },
        methods:{}
    });
    var This = {
        Io: null,
        Init: function () {
            This.Io = io('http://'+_PageData.VirtualPath.Socket.Domain+':'+_PageData.VirtualPath.Socket.Port+'/room');
            This.Io.on('connect', function () {
                testVue.tip = '联机成功';
            });
            This.Io.on('disconnect', function (data) {
                testVue.tip = '联机断开';
                window.document.location = '/login';
            });
        }
    };
    This.Init();
});