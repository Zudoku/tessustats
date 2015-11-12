'use strict';

angular.module('tessustats.controller.channel', [])
.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {

	$scope.updateData = function(){
		var channelsResource = $http.get('/query/channelpage/' + $routeParams.channelid).success(function(data) {
	    	$scope.channeldata = data;
		});
	};
	$scope.getPasswordProtectionString = function(value){
		if(value == 1){
			return "Password protected";
		}
		return "No password protection";
	};

	$scope.getVoiceEncryptionString = function(value){
		if(value == 1){
			return "Voice encryption";
		}
		return "No Voice encryption";
	};

	$scope.getActivityString = function(value){
		if(value == -1){
			return "Active right now!";
		}else{
			return "Empty for " + getTimeFromSeconds(value);
		}
	};

	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};
	$scope.selectuser=function(clientid){
		$location.path('/user/'+clientid);
	};
	
	$scope.updateData();

} ]);