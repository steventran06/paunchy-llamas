angular.module('codellama.codeshare', [])
.controller('CodeshareController', function($scope, $location) {
  $scope.init = function() {
    $scope.addCodeshare();
  };

  $scope.languages = [
    'select a language',
    'clike',
    'coffeescript',
    'css',
    'django',
    'html',
    'javascript',
    'jsx',
    'lua',
    'markdown',
    'python',
    'ruby',
    'sass',
    'sql',
    'swift',
    'yaml',
  ];

  $scope.themes = [
    'ambiance',
    '3024-day',
    '3024-night',
    'cobalt',
    'dracula',
    'eclipse',
    'elegant',
    'hopscotch',
    'icecoder',
    'isotope',
    'lesser-dark',
    'liquibyte',
    'material',
    'mbo',
    'mdn-like',
    'midnight',
    'monokai',
    'neat',
    'pastels-on-dark',
    'rubyblue',
    'seti',
    'solarized',
    'the-matrix',
    'tomorrow-night-bright',
    'tomorrow-night-eighties',
    'twilight',
    'vibrant-ink',
    'xq-dark',
    'xq-light',
    'yeti',
    'zenburn',
  ];

  $scope.setLanguage = function(lang) {
    console.log('This is the language: ', lang);
    codeMirrors[0].setOption('mode', lang);
  };
  $scope.setTheme = function(theme) {
    console.log('theme: ', theme)
    codeMirrors[0].setOption('theme', theme);
  };
  var socket = io('http://107.170.10.76:8000');
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

  // Debounce function from underscore
  // TODO: put this somewhere more relevant, like a utils file
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

  // Emit debounced data
  var emitKeypress = debounce(function(target, name, args) {
    var code = this.getValue();
    var cursorLoc = this.getCursor();
    var text = JSON.stringify(code);
    socket.emit('type code', text, username, cursorLoc);
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
    // console.log(patch_text);
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
      theme: 'mdn-like',
      lineNumbers: true
    });
  }

  // Add codeshare windows. We are instantiating new codeshare windows since we want each window to listen for unique
  // events, rather than all of them listening to the same event
  $scope.addCodeshare = function () {
    var codeshare = createCodeMirror();
    codeshare.eventHandlers = function() {
      this.on('keypress', emitKeypress.bind(this));

      socket.on('code', function(theirCode, theirCursorLoc) {
        // Get current user's code
        var myCode = this.getValue();
        // Get a stringified version of the diffed + patched code between current user's code and other user's code.
        // We don't parse this right away since we use the stringified version as well later on in the code.
        var patchString = codeDiff(myCode, theirCode);
        // Parse code to set value inside of the Code mirror, or else we will have quotes around our code.
        var patch = JSON.parse(patchString);
        // Get cursor location so that the cursor on CodeMirror doesn't reset.
        var cursorPos = this.getCursor();

        var theirCursorLocPrevChar = {
          line: theirCursorLoc.line,
          ch: theirCursorLoc.ch - 1
        }
        
        if (patch !== myCode) {
          this.setValue(patch);
        }
        if (theirCursorLoc.line !== cursorPos.line || theirCursorLoc.ch !== cursorPos.ch) {
          this.markText(theirCursorLocPrevChar, theirCursorLoc, {className: 'other-user'});
        }
        // setting cursor position when the text in the field changes
        // this prevents the cursor from showing up at line 0 character 0 whenever the codeshare window updates with new code
        var newLineBreaks = patch_text.match(/%0A/g);
        lineBreaksLength = newLineBreaks ? newLineBreaks.length : null;
        var newLineBreaksLength = lineBreaksLength - prevLineBreaksLength || 0
        prevLineBreaksLength = lineBreaksLength;
        this.setCursor(cursorPos.line, cursorPos.ch);
        // Naive solution to dealing with line breaks. Does not work completely, and we are better off without it for demo
        // if (newLineBreaksLength > 0) {
        //   this.setCursor(cursorPos.line + newLineBreaksLength, cursorPos.ch);
        // } else {
        //   this.setCursor(cursorPos.line, cursorPos.ch);
        // }
        socket.emit('save code', username, patchString, lineBreaksLength, prevLineBreaksLength);
        // myCodeMirror.setValue(code);
      }.bind(this));
    };
    codeMirrors.push(codeshare);
    // Initializes the event handlers and listeners
    codeMirrors[codeMirrors.length - 1].eventHandlers();
    // console.log(codeMirrors);
    return codeshare;
  };
})

// this works
.directive('icecomm', function() {
  return {
    restrict: 'AE',
    scope: {},
    bindToController: true,
    controller: function($attrs, $element) {
      var debugOptions = {debug: Boolean($attrs.debug)};
      var comm = new Icecomm($attrs.apikey, debugOptions);
      this.comm = comm;
      this.connect = comm.connect;
      // this.leave = comm.stop;
    },
    controllerAs: 'comm'
  }
})

// this works
.directive('icecommConnect', function() {
  return {
    restrict: 'E',
    require: '^icecomm',
    replace: true,
    scope: true,
    template: '<button ng-click="connect()">{{text}}</div>',
    link: function($scope, ele, atts, comm) {
      $scope.text = atts.text || "Connect";
      $scope.connect = function() {
        var connectOptions = createConnectOptions();
        comm.connect(atts.room, connectOptions);
      }
      function createConnectOptions() {
        var connectOptions = {};
        if (atts.video === 'false') {
          connectOptions.video = false;
        }
        if (atts.audio === 'false') {
          connectOptions.audio = false;
        }
        if (!atts.stream === 'false') {
          connectOptions.stream = false;
        }
        if (!atts.limit) {
          connectOptions.limit = atts.limit;
        }
        return connectOptions;
      }
    }
  };
})

.directive('icecommLeave', function() {
  return {
    restrict: 'E',
    require: '^icecomm',
    replace: true,
    template: '<button ng-if="local && hide" ng-click="leave()">' +
      '{{text}}</button>',
    link: function($scope, ele, atts, icecomm) {
      var comm = icecomm.comm;
      $scope.test = false;
      $scope.text = atts.text || "Disconnect";
      $scope.hide = atts.prestream === 'hide';
      $scope.leave = function() {
        comm.leave();
        $scope.local = null;
      }
    }
  };
})


.directive('icecommLocal', function($sce) {
  return {
    restrict: 'E',
    replace: true,
    require: '^icecomm',
    template: '<video ng-if="local" autoplay class="icecomm-local"' +
      'ng-src={{local.stream}}></video>',
    link: function($scope, ele, atts, icecomm) {
      var comm = icecomm.comm;
      comm.on("local",function(peer){
        $scope.$apply(function () {
          peer.stream = $sce.trustAsResourceUrl(peer.stream);
          $scope.local = peer;
        });
      });
    }
  };
})


.directive('icecommPeer', function($sce) {
  return {
    restrict: 'E',
    require: '^icecomm',
    replace: false,
    template:
    '<video ng-repeat="peer in peers" class="icecomm-peer"' +
      'autoplay ng-src="{{peer.stream}}"></video>',
    link: function($scope, ele, atts, icecomm) {
      var comm = icecomm.comm;
      $scope.peers = [];
      comm.on("connected", function(peer){
        $scope.$apply(function () {
          peer.stream = $sce.trustAsResourceUrl(peer.stream);
          $scope.peers.push(peer);
        });
      });
      comm.on("disconnect", function(peer){
        // $scope.$apply(function () {
          $scope.peers.splice($scope.peers.indexOf(peer),1);
        // });
      });
    }
  };
})
