'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/allusers').success(function(data) {
		$scope.users = data
	});
	
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};

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
		var recordResource = $http.get('/latestrecord/'+$routeParams.databaseid).success(function(record) {
			$scope.record = record;
			$scope.record.inputmutedstring = (record.inputmuted === 1) ? 'Muted' : 'On' ;
			$scope.record.outputmutedstring = (record.outputmuted === 1) ? 'Muted' : 'On' ;
		});


	});
	var allusers = $http.get('/allusers').success(function(allusers) {
		var foundAllUsersRecord = undefined;
		for(var index = 0 ; index < allusers.length; index++){
			var handled = allusers[index];
			var routeparams = undefined;
			try{
				routeparams = parseInt($routeParams.databaseid);
			}catch(error){

			}
			if(handled.databaseid === routeparams){
				handled.activityrank = ++index;
				foundAllUsersRecord = handled;

				break;
			}
		}

		$scope.allusersrecord = foundAllUsersRecord;
	});
	
} ]);
