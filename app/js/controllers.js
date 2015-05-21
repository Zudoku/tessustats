'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/allusers').success(function(data) {
		$scope.users = data
	})
	
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	}

} ])


.controller('countriesCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/allcountries').success(function(data) {
			$scope.countries = data
		})

		$scope.selectcountry=function(countrycode){

			$location.path('/country/'+countrycode);
		}

} ])

.controller('countryCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var countryResource = $http.get('/country/'+$routeParams.countrycode).success(function(data) {
			$scope.country = data;

		})

} ])

.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/allchannels').success(function(data) {
			$scope.channels = data
		})

		$scope.selectchannel=function(channelname){

			$location.path('/channel/'+channelname);
		}

} ])

.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var channelResource = $http.get('/channel/'+$routeParams.channelname).success(function(data) {
			$scope.channel = data;

		})

} ])

.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
	var userResource = $http.get('/user/'+$routeParams.databaseid).success(function(data) {
		$scope.user = data;

	})
	
} ]);
