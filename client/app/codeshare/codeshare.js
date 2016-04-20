angular.module('codellama.codeshare', [])
  .service('CodeshareService', function() {
    this.code = '';
  })
  .controller('CodeshareController', function($scope) {
    $scope.code = 'console.log(yaya)';

    var myCodeMirror = CodeMirror(document.getElementById('codeshareBox'), {
      value: '\'Write your code here\'',
      mode:  'javascript',
      theme: 'ambiance',
      lineNumbers: true
    });
    // for some reason CodeMirror(...) creates two codemirror dom elements, and so one is removed as a naive solution
    document.getElementByClass('Codemirror')[1].remove();
  });