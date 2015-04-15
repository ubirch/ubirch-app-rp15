var app = {
    isPhonegap: false,
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        if (typeof cordova != 'undefined') {
            $(document).on('deviceready', this.onDeviceReady);
            app.isPhonegap = true;
        } else {
            $(function(){
                app.onDeviceReady();
            });
        }
    },
    onDeviceReady: function () {
        ubirchTopo();

        FastClick.attach(document.body);

        $(window).on('map:ready', function(){
            // phonegap plugin
            if('splashscreen' in navigator){
                navigator.splashscreen.hide();
            }
            // activate css animations
            $('.app').addClass('ready');
        });
    }
};

app.initialize();