'use strict';

/* Controllers */

var ismultiple = function(number){
	if(number > 1){
		return 's';
	}
	else{
		return '';
	}
}

angular.module('myApp.controllers', [])


.controller('basicCtrl', ['$scope','$http','$location', function($scope, $http,$location) {

} ])
.controller('serverCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var serverResource = $http.get('/query/serverdata').success(function(data) {
		
		//Convert seconds to time
		var sec_num = data.uptime;
		
		
		var secondsInHour = (60 * 60);
		var secondsInDay = (secondsInHour * 24);
		
		
		var days    = Math.floor(sec_num / secondsInDay);
		var hours   = Math.floor((sec_num - days * secondsInDay) / secondsInHour);
	    var minutes = Math.floor((sec_num - days * secondsInDay - (hours * secondsInHour)) / 60);
	    var seconds = sec_num - days * secondsInDay - (hours * secondsInHour) - (minutes * 60);
	    
	    var dayString = (days === 0)? '' : days + ' day' + ismultiple(days) + ' ';
	    var hourString = (hours === 0)? '' : hours + ' hour' + ismultiple(hours) + ' ';
	    var minuteString = (minutes === 0)? '' : minutes + ' minute' + ismultiple(minutes) + ' ';
	    var secondString = (seconds === 0)? '' : seconds + ' second' + ismultiple(seconds) + ' ';
	    
	    data.uptime = dayString + hourString + minuteString + secondString;
		
		$scope.serverdata = data;
	});
	
	
} ])
.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/query/allusers').success(function(data) {
		$scope.users = data;
	});
	
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};

} ])


.controller('countriesCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/query/allcountries').success(function(data) {
			$scope.countries = data;
		});

		$scope.selectcountry=function(countrycode){

			$location.path('/country/'+countrycode);
		};

} ])

.controller('countryCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var countryResource = $http.get('/query/country/'+$routeParams.countrycode).success(function(data) {
			$scope.country = data;

		})

} ])

.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/query/allchannels').success(function(data) {
			$scope.channels = data
		})

		$scope.selectchannel=function(channelname){

			$location.path('/channel/'+channelname);
		}

} ])

.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var channelResource = $http.get('/query/channel/'+$routeParams.channelid).success(function(data) {
			$scope.channel = data;

		})

} ])

.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
	var userResource = $http.get('/query/user/'+$routeParams.databaseid).success(function(data) {
		$scope.user = data;
		var recordResource = $http.get('/query/latestrecord/'+$routeParams.databaseid).success(function(record) {
			$scope.record = record;
			$scope.record.inputmutedstring = (record.inputmuted === 1) ? 'Muted' : 'On' ;
			$scope.record.outputmutedstring = (record.outputmuted === 1) ? 'Muted' : 'On' ;
		});


	});
	var allusers = $http.get('/query/allusers').success(function(allusers) {
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
