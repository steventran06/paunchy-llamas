angular.module('codellama.github', [])

.controller('gitHubDataController', ['$scope', '$http', 'SearchService', 'TutorService', '$routeParams', function($scope, $http, SearchService, TutorService, $routeParams){

// inject service into controller
// inject routeParams to get github profile
  TutorService.getTutorProfile($routeParams.username)
  .then(function(data) {
    TutorService.tutorData = data;
  // send get request to github, receive max 30 repositories
  $http.get("https://api.github.com/users/" + TutorService.tutorData.github)
    .success(function (data) {
      $scope.userData = data;
      loadRepos();
      });    
  var loadRepos = function () {
      $http.get($scope.userData.repos_url)
          .success(function (data) {
              $scope.repoData = data;
          });
  };
  // sort repositories by updated_at
  $scope.predicate = '-updated_at';    
  });
    $scope.$watch(
      function() { 
        return TutorService.tutorData; },

      function(newVal) {
        $scope.tutor = newVal;
      }
    );
}]);