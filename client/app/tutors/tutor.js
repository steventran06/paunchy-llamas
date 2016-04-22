/* This module handles the tutor's profile view */
angular.module('codellama.tutor', [])

  .service('TutorService', function($http) {
    this.tutorData = null;

    this.getTutorProfile = function(username) {
      return $http({
        method: 'GET',
        url: '/api/tutor/' + username
      })
      .then(function (resp) {
        return resp.data;
      });
    };

    this.likeTutor = function(username) {
      return $http({
        method: 'PUT',
        data: {username: username},
        url: '/api/tutor/addLike'
      })
      .then(function(resp) {
        return resp.data;
      });
    };
  })

  .controller('TutorController', function ($scope, TutorService, $routeParams) {

    TutorService.getTutorProfile($routeParams.username)
    .then(function(data) {
      TutorService.tutorData = data;
    });

    $scope.likeTutor = function(username) {
      TutorService.likeTutor(username)
      .then(function(resp) {
        $scope.tutor.likes = resp.likes;
      })
      .catch(function(error) {
        console.log('there was an error updating number of likes', error);
      });
    };

    $scope.$watch(
      function() { return TutorService.tutorData; },

      function(newVal) {
        $scope.tutor = newVal;
      }
    );
  });


