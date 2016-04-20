angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = '';
  })
  .controller('CodeshareController', function($scope) {
    $scope.init = function() {
      $scope.addCodeshare();
    };
    $scope.addCodeshare = function () {
      var myCodeMirror = CodeMirror(document.getElementById('codeshare-input'), {
        value: '\'Write your code here\'',
        mode:  'javascript',
        theme: 'ambiance',
        lineNumbers: true
      });
    };
    var socket = io('http://localhost:8000');
    socket.on('connect', function() {
      console.log('We have connected');
    })
  });