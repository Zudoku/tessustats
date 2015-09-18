'use strict';

angular.module('tessustats.controller.channel', [])
.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var channelResource = $http.get('/query/channel/'+$routeParams.channelid).success(function(data) {
			$scope.channel = data;
			$scope.passwordString = ($scope.channel.passwordprotected == 0) ? "No password protection": "Password protection";
			$scope.encryptionString = ($scope.channel.encryptedvoice == 0) ? "No voice encryption": "Voice encryption";
			if($scope.channel.secondsempty == -1){
				$scope.activity = "Active";
			}else{
				$scope.activity = "Empty for " + getTimeFromSeconds($scope.channel.secondsempty);
			}
			$scope.encryptionString = ($scope.channel.encryptedvoice == 0) ? "No voice encryption": "Voice encryption";
			
			
			
		});

} ]);