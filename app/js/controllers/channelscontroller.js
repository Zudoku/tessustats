'use strict';

angular.module('tessustats.controller.channels', [])
.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var activeChannelResource = $http.get('/query/getAllActiveChannels').success(function(data) {
			$scope.activeChannels = data
		});
		
		
		$scope.selectChannel=function(channelname){

			$location.path('/channel/'+channelname);
		}
		$scope.handleChannels = function(){
			var channels = $scope.activeChannels;
			if(channels == undefined){
				return [];
			}
			
			var result = [];
			for(var y=0;y < channels.length; y++){
				if(channels[y].children == undefined){
					result.push(channels[y]);
				}else{
					var children = channels[y].children;
					//channels[y].children = undefined;
					result.push(channels[y]);
					
					for(var h= 0; h < children.length; h++){
						children[h].style="sub";
						result.push(children[h]);
					}
				}
			}
			$scope.handledChannels = result;
			return result;
		};
		$scope.passwordChannel = function(passwordprotected){
			if(passwordprotected == 0){
				return true;
			}else{
				return false;
			}
		};
		var lastScanClientsResource = $http.get('/query/lastscanclients').success(function(data) {
			var channelLastClientsList = [];
			var channelsPopulated = [];
			for(var y=0; y < data.length; y++){
				var client = data[y];
				if(channelsPopulated.indexOf(client.channel) == -1){
					channelsPopulated.push(client.channel);
					var channel = {
							cid : client.channel,
							clients : []
					};
					channel.clients.push(client);
					channelLastClientsList.push(channel);
				}else{
					for(var i = 0 ; i < channelLastClientsList.length; i++){
						if(channelLastClientsList[i].cid == client.channel){
							channelLastClientsList[i].clients.push(client);
							break;
						}
					}
				}
			}
			$scope.lastScan = channelLastClientsList;
		});

		
		$scope.getChannelData = function(cid){
			var lastScan = $scope.lastScan;
			if(lastScan == undefined){
				return;
			}
			for(var y=0; y < lastScan.length; y++){
				if(lastScan[y].cid == cid){
					return lastScan[y];
				}
			}
			return;
		};
		$scope.getTimeFromSeconds = function(seconds){
			return getTimeFromSeconds(seconds);
		};
		$scope.getTemporaryStyle = function(cid){
			for(var t =0 ; t < $scope.handledChannels.length ; t++){
				if(cid == $scope.handledChannels[t].cid && $scope.handledChannels[t].type == "Temporary"){
					return "warning";
				}
			}
			return "";
		};
		var inactiveChannelResource = $http.get('/query/getInactiveChannels').success(function(data) {
			$scope.inactiveChannels = data
		});
} ]);