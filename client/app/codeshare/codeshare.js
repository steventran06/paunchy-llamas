angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = 'lol';
  })
  .controller('CodeshareController', function($scope) {
    $scope.init = function() {
      $scope.addCodeshare();
    };
    var socket = io('http://localhost:8000');
    socket.on('connect', function() {
      console.log('We have connected');
    })
    $scope.addCodeshare = function () {
      var myCodeMirror = CodeMirror(document.getElementById('codeshare-input'), {
        value: '\'Write your code here\'',
        mode:  'javascript',
        theme: 'ambiance',
        lineNumbers: true
      });
      myCodeMirror.on('change', function(target, name, args) {
        socket.emit('type code', name.text[0]);
      })
    };
  });