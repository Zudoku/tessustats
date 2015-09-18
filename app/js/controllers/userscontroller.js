'use strict';

angular.module('tessustats.controller.users', [])
.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/query/allusers').success(function(usersdata) {
		
		var lastScanClients = $http.get('/query/lastscanclients').success(function(data) {
			$scope.users = usersdata;
			//Go through all the clients that were in the last scan
			for(var index = 0 ; index < data.length ; index++){
				var handledClient = data[index];
				//Find the client that has the same name
				for(var allusersIndex = 0 ; allusersIndex < usersdata.length ; allusersIndex++){
					if(usersdata[allusersIndex].databaseid === handledClient.databaseid){
						//Apply green color
						$scope.users[allusersIndex].textcolor = 'success';
					}
				}
			}
			
		});
		
	});
	var countriesResource = $http.get('/query/getAllUsersCountry').success(function(countriesData) {
		$scope.usercountries = countriesData;
	});
	var allScanClientsResource = $http.get('/query/usersAmount').success(function(data) {
		$scope.uniqueVisitors = data.users;
	});
	
	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};
	
	$scope.getCountry = function(clientid){
		if($scope.usercountries == undefined){
			return "";
		}
		for(var t = 0; t<$scope.usercountries.length ; t++){
			if($scope.usercountries[t].databaseid == clientid){
				return $scope.usercountries[t].country;
			}
		}
	}
	
	//Function for clicking the user in the list
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};
	
	$scope.selectCountry = function(country){
		$location.path('/country/'+country);
	};

} ]);