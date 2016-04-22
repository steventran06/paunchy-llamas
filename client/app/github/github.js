angular.module('codellama.github', [])

.controller('gitHubDataController', ['$scope', '$http', 'SearchService', '$routeParams', function($scope, $http, SearchService, $routeParams){

// inject service into controller
// inject routeParams to get github profile

  var githubHandle = $routeParams.github;

  // send get request to github, receive max 30 repositories
  $scope.username = githubHandle;
  $http.get("https://api.github.com/users/" + $scope.username)
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
}]);