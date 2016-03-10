'use strict';

angular.module('tessustats.controller.forumView', [])
.controller('forumviewCtrl', ['$scope','$http','$location','$routeParams','$cookies', function($scope, $http,$location,$routeParams,$cookies) {
	$scope.loggedInUser = false;

	$scope.updateData = function(){
		var forumpostsResource = $http.get('/query/forumView/').success(function(data) {
	    	$scope.forumData = data;
		});
	};
	

	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};
	
	$scope.registerAcc = function(register){
		var uniqueID = register;
		console.log(uniqueID);
		if(uniqueID == undefined || uniqueID == ""){
			alert("Empty field: Unique ID");
			return;
		}

		//Make HTTP POST request with that uniqueID
		var registerQuery = $http.post('/registration/new/' + uniqueID).success(function(data) {


			console.log(JSON.stringify(data));

	    	if(data.success == true){
	    		//Move the 
	    		$location.url("/registration/confirm/" + data.uniqueID + "/" + data.databaseID);

	    	}else{
	    		alert("Error: " + data.msg);
	    	}
		});

	};

	$scope.isLoggedIn = function() {

		var authGuid = $cookies.get("authenticationGUID");

		if(authGuid == undefined) {
			return false;
		}
		var forumpostsResource = $http.get('/query/forum/auth/' + authGuid).success(function(data) {
			
	    	if(data.success){
	    		$scope.authentication = data;
	    		$scope.loggedInUser = true;
	    		return true;
	    	}else{
	    		return false;
	    	}
		});
	};

	$scope.login = function(authguid) {
		var cookieConfig = {
			path : '/',
			domain: "127.0.0.1", //'127.0.0.1' for DEV '.tessustats.ovh' for PRODUCTION
			expires : "Fri, 31 Dec 2025 23:59:59 GMT",
			secure : false
		};
		$cookies.put("authenticationGUID",authguid,cookieConfig);
		location.reload();

	};

	$scope.logout = function() {

		var cookieConfig = {
			path : '/',
			domain: "127.0.0.1", //'127.0.0.1' for DEV '.tessustats.ovh' for PRODUCTION
			expires : "Fri, 31 Dec 2025 23:59:59 GMT",
			secure : false
		};
		$cookies.put("authenticationGUID","a",cookieConfig);
		location.reload();
		
	};

	$scope.makeNewPost = function() {
		$location.url("/forum/newpost/");
	}

	$scope.isLoggedIn();
	$scope.updateData();

} ]);