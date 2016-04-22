angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = 'lol';
  })
  .controller('CodeshareController', function($scope, $location) {
    $scope.init = function() {
      $scope.addCodeshare();
    };
    var socket = io('http://localhost:8000');
    // var socket = io('http://107.170.10.76:8000');
    var partPath = $location.$$path.slice(7);
    var username = partPath.slice(0, partPath.indexOf('/'))
    socket.on('connect', function() {
      socket.emit('join codeshare room', username);
    });
    // Send saved code if the session already has typed in code.
    socket.on('send saved code data', function(codeshareData) {
      if (codeshareData) {
        var parsedCode = JSON.parse(codeshareData.patch);
        codeMirrors[0].setValue(parsedCode);
        lineBreaksLength = codeshareData.lineBreaksLength;
        prevLineBreaksLength = codeshareData.prevLineBreaksLength;
      }
    });
    // Create an array of code mirrors since we want to have multiple tabs
    var codeMirrors = [];

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
    var emitKeypress = debounce(function(target, name, args) {
      var code = this.getValue();
      var text = JSON.stringify(code);
      socket.emit('type code', text, username);
    }, 50);

    // Load in the Google Difference, Match, Patch algorithm
    var dmp = new diff_match_patch();
    var patch_text = '';
    var prevLineBreaksLength = 0;
    var lineBreaksLength = 0;

    // This finds the difference between the code of user1 and user2
    var codeDiff = function(code1, code2) {
      var d = dmp.diff_main(code1, code2, true);
      var patch_list = dmp.patch_make(code1, code2, d);
      patch_text = dmp.patch_toText(patch_list);
      console.log(patch_text);
      return codePatch(code1);
    };
    // Patch code after finding a difference between the two
    var codePatch = function(code) {
      var patches = dmp.patch_fromText(patch_text);
      var results = dmp.patch_apply(patches, code);
      return results[0];
    };

    var createCodeMirror = function() {
      return CodeMirror(document.getElementById('codeshare-input'), {
        value: '\'Write your code here\'',
        mode:  'javascript',
        theme: 'ambiance',
        lineNumbers: true
      });
    }

    // Add codeshare windows. We are instantiating new codeshare windows since we want each window to listen for unique
    // events, rather than all of them listening to the same event
    $scope.addCodeshare = function () {
      var codeshare = createCodeMirror();
      codeshare.eventHandlers = function() {
        this.on('keypress', emitKeypress.bind(this));
        socket.on('code', function(theirCode) {
          var myCode = this.getValue();
          var patchString = codeDiff(myCode, theirCode);
          var patch = JSON.parse(patchString);
          // Get cursor location so that the cursor on CodeMirror doesn't reset.
          var cursorPos = this.getCursor();

          if (patch !== myCode) {
            this.setValue(patch);
          }
          // setting cursor position when the text in the field changes
          // this prevents the cursor from showing up at line 0 character 0 whenever the codeshare window updates with new code
          var newLineBreaks = patch_text.match(/%0A/g);
          console.log(patch_text);
          console.log(newLineBreaks);
          lineBreaksLength = newLineBreaks ? newLineBreaks.length : null;
          var newLineBreaksLength = lineBreaksLength - prevLineBreaksLength || 0
          prevLineBreaksLength = lineBreaksLength;
          console.log('line breaks: ', lineBreaksLength);
          console.log('new line breaks: ', newLineBreaksLength);
          console.log('prev line breaks: ', prevLineBreaksLength);
          if (newLineBreaksLength > 0) {
            // console.log('cursor line position: ', cursorPos.line);
            // console.log('cursor character position: ', cursorPos.ch);
            // console.log('line breaks length: ', lineBreaksLength);
            // console.log('cursor line position + line breaks length: ', cursorPos.line + lineBreaksLength);
            this.setCursor(cursorPos.line + newLineBreaksLength, cursorPos.ch);
          } else {
            this.setCursor(cursorPos.line, cursorPos.ch);
          }
          socket.emit('save code', username, patchString, lineBreaksLength, prevLineBreaksLength);
          // myCodeMirror.setValue(code);
        }.bind(this));
      };
      codeMirrors.push(codeshare);
      codeMirrors[codeMirrors.length - 1].eventHandlers();
      console.log(codeMirrors);
      return codeshare;
    };
  });


