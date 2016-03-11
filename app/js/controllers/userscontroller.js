'use strict';

angular.module('tessustats.controller.users', [])
.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {



	$scope.updateData = function(){
		var serverResource = $http.get('/query/userspage').success(function(data) {
			
	    	//Making  things pretty for user

	    	//Loop last seen clients
	    	for(var index = 0 ; index < data.lastscanclients.length ; index++){
				var handledClient = data.lastscanclients[index];
				//Find the client that has the same name
				for(var allusersIndex = 0 ; allusersIndex < data.userlist.length ; allusersIndex++){
					if(data.userlist[allusersIndex].databaseid === handledClient.databaseid){
						//Apply green color
						data.userlist[allusersIndex].textcolor = 'success-dark';
					}
				}
			}

	    	$scope.usersdata = data;
	    	$scope.namefiltering();
		});
	};
	
	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};

	
	//Function for clicking the user in the list
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};
	
	$scope.selectCountry = function(country){
		$location.path('/country/'+country);
	};

	$scope.namefiltering = function(){
		if($scope.namemodel != undefined && $scope.usersdata != undefined){
			$scope.shownusers = $scope.usersdata.userlist.filter(function(value){

				var nickname = value.nickname.toLowerCase();
				var model = $scope.namemodel.toLowerCase();

				return (nickname.indexOf(model) > -1);
			});
		}else{
			if($scope.usersdata != undefined){
				$scope.shownusers = $scope.usersdata.userlist;
			}

		}
	};

	$scope.getActivityRank = function(databaseid){
		for(var c = 0 ; c < $scope.usersdata.userlist.length; c++){
			if($scope.usersdata.userlist[c].databaseid == databaseid){
				return c + 1;
			}
		}
		return "?";
	};

	$scope.updateData();

} ]);