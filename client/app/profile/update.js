/* This module handles updating the profile, including photo upload, subjects, and cities */
var app = angular.module('codellama.fileUpload', ['ngFileUpload', 'checklist-model', 'uiGmapgoogle-maps']);

app.controller('uploadCtrl', ['$scope', '$http', 'uiGmapGoogleMapApi', 'Upload', '$timeout', '$location', '$window', '$rootScope', function ($scope, $http, GoogleMapApi, Upload, $timeout, $location, $window, $rootScope) {
  $scope.data = {};
  $scope.data.subjects = [];
  $scope.data.location = {};
  $scope.data.coordinates = {};
  $scope.data.times = [];

  $scope.times = [
    'Espresso Shift (6am - 9am)',
    'Coffee Shift (9am - Noon)',
    'Black Tea Shift (Noon - 3pm)',
    'Latte Shift (3pm - 6pm)',
    'Mocha Shift (6pm - 9pm)',
    'Green Tea Shift (9pm - Midnight)',
    'Red Bull Shift (Midnight - 6am)'
  ];

  $scope.subjects = [
    'Javascript',
    'C',
    'Python',
    'Ruby',
    'Angular',
    'React',
    'Backbone',
    'HTML',
    'CSS'
  ];

  $scope.states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District Of Columbia',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];


  $scope.uploadPic = function(file) { //uploads pic and/or new profile information
    // data.isTutor is assigned conditionally in update.html
    // but we want it to be default true for becometutor.html
    // console.log('$scope.data.isTutor is',$scope.data.isTutor);
    // if ($scope.data.isTutor === undefined) {
    //   $scope.data.isTutor = true;
    // }
    console.log('$scope.data.isTutor is',$scope.data.isTutor);

    // $scope.data.isTutor = $scope.data.isTutor || true;

    if (!file) { var file = {}; } else {  $scope.data.file = file;  }

      var myAddress = $scope.data.location;
      var street = myAddress.address.split(' ').join('+');
      var city = myAddress.city.split(' ').join('+');
      var state = myAddress.state.split(' ').join('+');
      $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + street + city + state + '&key=AIzaSyDvrSHps67YwiBew80UDfSQ0gepQ6wYvuI').success(function(data) {
        $scope.data.coordinates = data.results[0].geometry.location;
        console.log($scope.data);
        file.upload = Upload.upload({
          url: 'api/users/profile',
          data: $scope.data
        });

        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;
          });
          // reset become tutor option, if the tutor form 'is tutor' checkbox is checked
          if ($scope.data.isTutor) {
            $rootScope.isTutor = true;
            $window.localStorage.setItem('isTutor', true);
          }
          // redirect to home
          $location.path('/');

        }, function (response) {
          if (response.status > 0) {
            $scope.errorMsg = response.status + ': ' + response.data;
          }
        }, function (evt) {
        // Math.min is to fix IE which reports 200% sometimes
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    });
      
  };
}]);