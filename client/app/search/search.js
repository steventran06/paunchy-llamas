
var app = angular.module('codellama.search', ['uiGmapgoogle-maps']);

app.service('SearchService', function($http, $window) {

  // initialize empty tutor data array that will hold search results
  this.tutorData = [];
  this.myData = {};

  this.getTutors = function(city, subjects) {
    // parsing the strings will be handled server-side
    return $http({
      method: 'GET',
      url: '/api/tutor/search',
      params: {
        city: city,
        subjects: subjects
      }
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  this.getProfile = function() {
    // var token = $window.localStorage.getItem('com.codellama');
    return $http({
      method: 'GET',
      url: '/api/users/myProfile',
    }).then(function(resp) {
      return resp.data;
    });
  };

});

app.controller('SearchController', function ($scope, SearchService, $location) {

  // define search on scope
  $scope.search = function(city, subjects) {


    // call function from SearchService
    SearchService.getTutors(city, subjects)

      // upon success, assign returned tutors data to scope's tutorData
      .then(function(tutors) {
        SearchService.tutorData = tutors;
        SearchService.getProfile()
          .then(function(profile) {
            SearchService.myData = profile;
            $location.path('/search');
          })
          .catch(function(error) {
            console.log('There was an error retrieving profile data: ', error);
        });
      })

      // on error, console log error
      .catch(function(error) {
        console.log('There was an error retrieving tutor data: ', error);
      });
  };
});

app.controller('SearchResultsController', function ($scope, $timeout, uiGmapGoogleMapApi, SearchService) {

  $scope.tutor = {};
  $scope.tutor.likes = 0;

  $scope.clicked = function() {
    console.log('clicked');
    $scope.tutor.likes++;
    console.log('$scope.tutor.likes is', $scope.tutor.likes);
  };

  $scope.$watch(
    function() { return SearchService.tutorData; },


    function(newVal) {
      if (newVal.length !== 0) {
        var centerLatitude = 0;
        var centerLongitude = 0;

        uiGmapGoogleMapApi.then(function(maps) {
          // set bounds for map
          var myBounds = new maps.LatLngBounds();
          var icon = new maps.MarkerImage("../assets/pencil.png",
            new google.maps.Size(45, 45),
            new google.maps.Point(0, 0),
            new google.maps.Point(0, 45)
          );

          var circles = [];
          var markers = [];
          var counter = 1;

          for (var i = 0; i < newVal.length; i++) {
            // set center point of map
            centerLatitude += parseFloat(newVal[i].coordinates.lat);
            centerLongitude += parseFloat(newVal[i].coordinates.lng);

            //set bounds for map
            var _tmp_position = new maps.LatLng(
              newVal[i].coordinates.lat, 
              newVal[i].coordinates.lng);
            myBounds.extend(_tmp_position);

            // create circle
            var circle = {
              id: counter,
              title: newVal[i].username,
              center: {
                latitude: newVal[i].coordinates.lat,
                longitude: newVal[i].coordinates.lng
              },
              radius: 500,
              stroke: {
                color: '#08B21F',
                weight: 2,
                opacity: 1
              },
              fill: {
                color: '#08B21F',
                opacity: 0.5
              },
              geodesic: false, // optional: defaults to false
              draggable: false, // optional: defaults to false
              clickable: true, // optional: defaults to true
              editable: false, // optional: defaults to false
              visible: true, // optional: defaults to true
              control: {}
            };
            circles.push(circle);

            // create marker with text
            var marker = {
              id: counter,
              coords: {
                latitude: newVal[i].coordinates.lat,
                longitude: newVal[i].coordinates.lng
              },
              icon: icon,
              options: {
                labelContent : "Tutor: " + newVal[i].username,
                labelAnchor: "0 0",
                labelClass: 'labelClass',
                labelInBackground: false
              }
            };
            markers.push(marker);

            counter++;
          }
          // Build map
          $scope.map = {
            center: { 
              latitude: centerLatitude / newVal.length,
              longitude: centerLongitude / newVal.length
            }, 
            zoom: 10,
            bounds: myBounds,
            options: {
              scrollwheel: true
            },
            circles: circles,
            markers: markers,
          };
        });
      }

      $scope.tutorData = newVal;
      $scope.subjectLength = newVal.length;
    }
  );
});