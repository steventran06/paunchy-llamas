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

    // Debounce function
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    // Emit code
    var emit = debounce(function(target, name, args) {
      var code = this.getValue();
      var text = JSON.stringify(code);
      socket.emit('type code', text, path);
    }, 1000);

    // Load in the Google Difference, Match, Patch algorithm
    var dmp = new diff_match_patch();
    var patch_text = '';

    // This finds the difference between the code of user1 and user2
    var codeDiff = function(code1, code2) {
      var d = dmp.diff_main(code1, code2, true);
      var patch_list = dmp.patch_make(code1, code2, d);
      patch_text = dmp.patch_toText(patch_list);
      return codePatch(code1);
    };

    var codePatch = function(code) {
      var patches = dmp.patch_fromText(patch_text);
      var results = dmp.patch_apply(patches, code);
      return results[0];
    };

    $scope.addCodeshare = function () {
      var myCodeMirror = CodeMirror(document.getElementById('codeshare-input'), {
        value: '\'Write your code here\'',
        mode:  'javascript',
        theme: 'ambiance',
        lineNumbers: true
      });
      myCodeMirror.on('keypress', emit.bind(myCodeMirror));
      socket.on('code', function(theirCode) {
        var myCode = myCodeMirror.getValue();
        var diff = JSON.parse(codeDiff(myCode, theirCode));
        var cursorPos = myCodeMirror.getCursor();
        console.log('Hello : ', cursorPos);
        if (diff !== myCode) {
          myCodeMirror.setValue(diff);
        }
        // myCodeMirror.setValue(code);
      });
    };
  });