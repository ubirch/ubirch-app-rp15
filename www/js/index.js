var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        if (typeof cordova != 'undefined') {
            $(document).on('deviceready', this.onDeviceReady);
        } else {
            $(function(){
                app.onDeviceReady();
            });
        }
    },
    onDeviceReady: function () {
        ubirchTopo();

        FastClick.attach(document.body);

        window.setTimeout(function(){
            $('.app')
                .addClass('ready');
        },500);
    }
};

app.initialize();