angular.module('codellama.github', [])

.controller('gitHubDataController', ['$scope', '$http', 'SearchService', '$routeParams', function($scope, $http, SearchService, $routeParams){

  var githubHandle = $routeParams.github;

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

  $scope.predicate = '-updated_at';

  // $scope.onSubmit = function(){
  
  // if($scope.title === undefined) { return; }
  //   $scope.reposLoaded = false;
  //   $scope.userLoaded = false;
  //   $scope.username = 'torsinclair';
  //     $http.get("https://api.github.com/users/" + $scope.username)
  //       .success(function (data) {
  //         console.log($scope.username);
  //         $scope.userData = data;
  //         loadRepos();
  //         });    

  //   var loadRepos = function () {
  //       $http.get($scope.userData.repos_url)
  //           .success(function (data) {
  //               $scope.repoData = data;
  //           });
  //   };
  // $scope.predicate = '-updated_at';
  // };

}]);