'use strict';

angular.module('tessustats.controller.channels', [])
.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	

	$scope.updateData = function(){
		var channelsResource = $http.get('/query/channelspage').success(function(data) {
	    	$scope.channelsdata = data;
		});
	};
	$scope.selectChannel=function(channelname){
		$location.path('/channel/'+channelname);
	}
	$scope.getTemporaryStyle = function(cid){
		for(var t =0 ; t < $scope.channelsdata.activeChannels.length ; t++){
			var channel = $scope.channelsdata.activeChannels[t];
			if(cid == channel.cid && channel.type == "Temporary"){
				return "warning";
			}
		}
		return "";
	};
	$scope.passwordChannel = function(passwordprotected){
		if(passwordprotected == 0){
			return true;
		}else{
			return false;
		}
	};
	$scope.getOnlineUsersForChannel = function(cid){
		var result = [];
		if($scope.channelsdata.lastscanclients == undefined){
			return [];
		}else{
			for(var i = 0 ; i < $scope.channelsdata.lastscanclients.length ; i++){
				var client = $scope.channelsdata.lastscanclients[i];
				if(client.channel == cid){
					result.push(client);
				}
			}
			return result;
		}
	};
	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};
	$scope.getPaddingChannelLevel = function(level){
		return level * 30;
	};	
		
	$scope.updateData();
} ]);