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
    $scope.status = true;

    // get current logged in user
    // ToggleService.getProfile()
    //   .then(function(res) {
    //     var username = res.username;
    //     console.log('previous status was ', res.status)

    //     // toggle on or off
    //     ToggleService.toggle(username, $scope.status)
    //       .then(function(res) {
    //         console.log('status has been changed to ', $scope.status)
    //       })
    //       .catch(function(err) {
    //         console.log(err)
    //       })
    //   })
    //   .catch(function(err) {
    //     console.log(err);
    //   })

  }

  // $scope.$on('$viewContentLoaded', function(){
  //   //Here your view content is fully loaded !!
  // });
  
  $scope.changeStatus = function(){

    // toggle status
    if ($scope.status === false) {
      $scope.status = true;
    } else {
      $scope.status = false;
    }

    // get current logged in user
    ToggleService.getProfile()
      .then(function(res) {
        var username = res.username;
        console.log('previous status was ', res.status)

        // toggle on or off
        ToggleService.toggle(username, $scope.status)
          .then(function(res) {
            console.log('status has been changed to ', $scope.status)
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




