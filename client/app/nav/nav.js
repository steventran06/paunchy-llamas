angular.module('codellama.nav', [])

.service('ToggleService', function($http) {
  this.toggleOn = function(username) {
    return $http({
      method: 'PUT',
      data: {username: username},
      url: '/api/tutor/toggleOn'
    })
    .then(function(resp) {
      return resp.data;
    });
  };
  this.toggleOff = function(username) {
    return $http({
      method: 'PUT',
      data: {username: username},
      url: '/api/tutor/toggleOn'
    })
    .then(function(resp) {
      return resp.data;
    });
  };
})

.controller('NavController', function($scope, $rootScope, Auth, $location) {

  // adds bootstrap active class if path matches href value
  $scope.isActive = function (viewLocation) { 
    return viewLocation === $location.path();
  }
})

.controller('ToggleController', function($scope, $rootScope, Auth){
  
  $scope.init = function(){
    $scope.status = 1;
  }
  
  $scope.changeStatus = function(){

    if ($scope.status === 1) {
      $scope.status = 0
    } else {
      $scope.status = 1
    }

    console.log('$rootScope is', $rootScope)
    console.log('$scope is', $scope)
    console.log('Auth is ', Auth)


    if ($scope.status === 1) {
      console.log('status is 1')
      // ToggleService.toggleOn(username)
      // .then(function(resp) {
      //   $scope.tutor.status = resp.status;
      // })
      // .catch(function(error) {
      //   console.log('there was an error updating status to on', error);
      // });      
    } else {
      console.log('status is 0')
      // ToggleService.toggleOff(username)
      // .then(function(resp) {
      //   $scope.tutor.status = resp.status;
      // })
      // .catch(function(error) {
      //   console.log('there was an error toggling status off', error);
      // });     
    }
  }
})




