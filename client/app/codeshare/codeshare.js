angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = 'lol';
  })
  .controller('CodeshareController', function($scope, $location) {
    $scope.init = function() {
      $scope.addCodeshare();
    };
    var socket = io('http://107.170.10.76:8000');
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
        var code = myCodeMirror.getValue();
        var text = JSON.stringify(code);
        socket.emit('type code', text, path);
      })
    };
  });