angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = 'lol';
  })
  .controller('CodeshareController', function($scope, $location) {
    $scope.init = function() {
      $scope.addCodeshare();
    };
    var socket = io('http://localhost:8000');
    var partPath = $location.$$path.slice(7);
    var path = partPath.slice(0, partPath.indexOf('/'))
    socket.on('connect', function() {
      socket.emit('join codeshare room', path);
    });
    socket.on('code', function(code) {
      console.log(code);
    });
    $scope.addCodeshare = function () {
      var myCodeMirror = CodeMirror(document.getElementById('codeshare-input'), {
        value: '\'Write your code here\'',
        mode:  'javascript',
        theme: 'ambiance',
        lineNumbers: true
      });
      myCodeMirror.on('change', function(target, name, args) {
        socket.emit('type code', name.text[0], path);
      })
    };
  });