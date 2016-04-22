angular.module('codellama.nav', [])

.service('ToggleService', function($http) {

  this.getProfile = function() {
    // var token = $window.localStorage.getItem('com.codellama');
    return $http({
      method: 'GET',
      url: '/api/users/myProfile',
    }).then(function(resp) {
      return resp.data;
      console.log('data is ', resp.data)
    });
  }; 
  this.toggle = function(username, status) {
    return $http({
      method: 'PUT',
      data: {username: username, status: status},
      url: '/api/tutor/toggle'
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

.controller('ToggleController', function($scope, ToggleService){
  
  $scope.init = function(){
    // 0 is on, 1 is off
    $scope.status = 0;
  }
  
  $scope.changeStatus = function(){

    // toggle status
    if ($scope.status === 1) {
      $scope.status = 0
    } else {
      $scope.status = 1
    }

    // get current logged in user
    ToggleService.getProfile()
      .then(function(res) {
        var username = res.username;
        console.log('status is', res.status)

        // toggle on or off
        ToggleService.toggle(username, $scope.status)
          .then(function(res) {
          })
          .catch(function(err) {
            console.log(err)
          })
      })
      .catch(function(err) {
        console.log(err);
      })
  }
})




