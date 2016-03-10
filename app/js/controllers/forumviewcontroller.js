'use strict';

angular.module('tessustats.controller.forumView', [])
.controller('forumviewCtrl', ['$scope','$http','$location','$routeParams','$cookies', function($scope, $http,$location,$routeParams,$cookies) {
	$scope.loggedInUser = false;

	$scope.updateData = function(){
		var forumpostsResource = $http.get('/query/forumView/').success(function(data) {
	    	$scope.forumData = data;
	    	console.log(JSON.stringify(data));

	    	var ids = [];
	    	for(var y = 0 ; y < data.forumPosts.length; y++) {
	    		if(ids.indexOf(data.forumPosts[y].creator) == -1){
	    			ids.push(data.forumPosts[y].creator);
	    		}
	    	}

	    	$scope.checkOutNamesFor(ids);

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
		var registerQuery = $http.get('/registration/new/' + uniqueID).success(function(data) {


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
			domain: ".tessustats.ovh", //'127.0.0.1' for DEV '.tessustats.ovh' for PRODUCTION
			expires : "Fri, 31 Dec 2025 23:59:59 GMT",
			secure : false
		};
		$cookies.put("authenticationGUID",authguid,cookieConfig);
		location.reload();

	};

	$scope.checkOutNamesFor = function(ids){
		console.log(JSON.stringify(ids));
		if(ids == undefined) {
			return ;
		}
		var nameCheckQuery = $http.post('/query/names',{ ids : ids });

		nameCheckQuery.success(function(data) {
			console.log(JSON.stringify(data));
			if(data.success){
				for(var t = 0 ; t < data.ids.length; t++) {
					var userObject = data.ids[t];
					console.log(JSON.stringify(userObject));

					$scope.nameBank["" +userObject.databaseid] = userObject;
				}

				console.log(JSON.stringify($scope.nameBank));

			} else {
				
			}

			
		});

		nameCheckQuery.error(function(data) {
			console.log(JSON.stringify(data));
		});

	};

	$scope.logout = function() {

		var cookieConfig = {
			path : '/',
			domain: ".tessustats.ovh", //'127.0.0.1' for DEV '.tessustats.ovh' for PRODUCTION
			expires : "Fri, 31 Dec 2025 23:59:59 GMT",
			secure : false
		};
		$cookies.put("authenticationGUID","a",cookieConfig);
		location.reload();
		
	};

	$scope.getTime = function(time){
		var timeDate = new Date(time);
		return timeDate.toLocaleString();
	};

	$scope.getNameFor = function(ID){
		if( $scope.nameBank[ID] == undefined) {
			return "" + ID;
		}else {
			return $scope.nameBank[ID].nickname;
		}
		
	};

	$scope.goToPost = function(postID){
		$location.url("/forum/post/" + postID);
	}

	$scope.makeNewPost = function() {
		$location.url("/forum/newpost/");
	};

	$scope.nameBank = {};
	$scope.isLoggedIn();
	$scope.updateData();

} ]);