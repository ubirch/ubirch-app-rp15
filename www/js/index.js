//var app = {
//  initialize: function () {
//    this.bindEvents();
//  },
//  bindEvents: function () {
//    // 'load', 'deviceready', 'offline', and 'online'.
//    document.addEventListener('deviceready', this.onDeviceReady, false);
//  },
//  // The scope of 'this' is the event. In order to call the 'receivedEvent'
//  // function, we must explicitly call 'app.receivedEvent(...);'
//  onDeviceReady: function () {
//    var app = document.getElementById("app");
//    ubirchTopo(app);
//  }
//};
//
//app.initialize();

window.onload = function () {
  var app = document.getElementById("app");
  ubirchTopo(app);
};