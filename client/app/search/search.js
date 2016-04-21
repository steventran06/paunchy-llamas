
var app = angular.module('codellama.search', ['uiGmapgoogle-maps']);

app.service('SearchService', function($http) {

  // initialize empty tutor data array that will hold search results
  this.tutorData = [];

  this.getTutors = function(city, subjects) {
    // parsing the strings will be handled sever-side

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
});

app.controller('SearchController', function ($scope, SearchService, $location) {

  // define search on scope
  $scope.search = function(city, subjects) {

    // call function from SearchService
    SearchService.getTutors(city, subjects)

      // upon success, assign returned tutors data to scope's tutorData
      .then(function(tutors) {
        SearchService.tutorData = tutors;
        $location.path('/search');
      })

      // on error, console log error
      .catch(function(error) {
        console.log('There was an error retrieving tutor data: ', error);
      });
  };
});

app.controller('SearchResultsController', function ($scope, uiGmapGoogleMapApi, SearchService) {

  // some map shit
  var counter = 1;



  uiGmapGoogleMapApi.then(function(maps) {
    console.log(maps);
  });

  // GoogleMapApi.then(function(maps) {
  //   maps.visualRefresh = true;
  // });


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

        
        centerLatitude = 0;
        centerLongitude = 0;

        for (var i = 0; i < newVal.length; i++) {
          centerLatitude += parseFloat(newVal[i].coordinates.lat);
          centerLongitude += parseFloat(newVal[i].coordinates.lng);
        }
       
        $scope.map = {
          center: { 
            latitude: centerLatitude / newVal.length,
            longitude: centerLongitude / newVal.length
          }, 
          zoom: 12,
          // bounds: {
          //   northeast: {
          //     latitude: 38,
          //     longitude: -122
          //   },
          //   southwest: {
          //     latitude: 37,
          //     longitude: -121
          //   }
          // },
          options: {
            scrollwheel: true
          },
          circles: []
        };

        for (var j = 0; j < newVal.length; j++) {
          // create circle for each tutor
          var circle = {
            id: counter,
            center: {
                latitude: newVal[j].coordinates.lat,
                longitude: newVal[j].coordinates.lng
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
            geodesic: true, // optional: defaults to false
            draggable: true, // optional: defaults to false
            clickable: true, // optional: defaults to true
            editable: true, // optional: defaults to false
            visible: true, // optional: defaults to true
            control: {}
          };
          // add circle to map
          $scope.map.circles.push(circle);
          counter++;

        }




      }






      $scope.tutorData = newVal;
      $scope.subjectLength = newVal.length;
    }
  );

  // console.log(SearchService.tutorData);
  // console.log('$search results scope.tutorData:', $scope.tutorData);

});


