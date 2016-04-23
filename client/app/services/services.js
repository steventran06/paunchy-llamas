
angular.module('codellama.services', [])

.factory('Auth', function ($http, $location, $window) {
  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin/',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var signup = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup/',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  /* Update logged-in and is-tutor status with these functions*/
  /* Currently only called when app runs in app.js's .run */
  // Runs function when clicking "Log out" - use this to change status? 
  var isLoggedIn = function () {
    return !!$window.localStorage.getItem('com.codellama');
  };

  var isLoggedInButNotTutor = function() {
    return isLoggedIn() && $window.localStorage.getItem('isTutor') === true;
  };

  return {
    signin: signin,
    signup: signup,
    isLoggedIn: isLoggedIn,
    isLoggedInButNotTutor: isLoggedInButNotTutor,
  };

});