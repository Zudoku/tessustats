'use strict';

angular.module('tessustats.controller.user', [])
.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
	var userResource = $http.get('/query/user/'+$routeParams.databaseid).success(function(data) {
		$scope.user = data;
		
		
		
		
		var recordResource = $http.get('/query/latestrecord/'+$routeParams.databaseid).success(function(record) {
			var scanDate = moment.utc(record.date).toDate();
			record.date = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
			$scope.record = record;
			$scope.record.inputmutedstring = (record.inputmuted === 1) ? 'Muted' : 'On' ;
			$scope.record.outputmutedstring = (record.outputmuted === 1) ? 'Muted' : 'On' ;
			
			var channelName = $http.get('/query/channelname/' + record.channel).success(function(channelName) {
				$scope.channelName = channelName.name;
			});
			
		});
		var lastscanclients = $http.get('/query/lastscanclients').success(function(lastscan) {
			for(var index = 0; index < lastscan.length ; index++){
				if(lastscan[index].databaseid === $scope.user.databaseid){
					$scope.onlineRightNow = 'Online!';
					$scope.onlineClass = 'text-success';
				}
			}
			if($scope.onlineRightNow != 'Online!'){
				$scope.onlineRightNow = 'offline';
				$scope.onlineClass = 'text-warning';
			}
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
	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};
	
	
} ]);