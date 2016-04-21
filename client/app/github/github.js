
angular.module('codellama.github', [])
.controller('gitHubDataController', ['$scope', '$http', function($scope, $http){
  $scope.onSubmit = function(){
    
  if($scope.title === undefined) { return; }
    $scope.reposLoaded = false;
    $scope.userLoaded = false;
    $scope.username = $scope.title;
      $http.get("https://api.github.com/users/" + $scope.username)
        .success(function (data) {
          console.log(data);
          console.log($scope.username);
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
  };

}]);