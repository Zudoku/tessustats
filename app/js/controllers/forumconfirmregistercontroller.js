'use strict';

angular.module('tessustats.controller.forumconfirm', [])
.controller('forumconfirmCtrl', ['$scope','$http','$location','$routeParams','$cookies', function($scope, $http,$location,$routeParams,$cookies) {

	$scope.updateData = function(){
		//var forumpostsResource = $http.get('/query/forumView/').success(function(data) {
	    //	$scope.x = data;
		//});
	};
	
	$scope.completeRegister = function(authguid){
		console.log(authguid);
		if(authguid == undefined || authguid == ""){
			alert("Empty field: Authentication GUID");
			return;
		}

		//Make HTTP POST request with that uniqueID
		var registerQuery = $http.get('/registration/confirm/' +  $routeParams.uniqueID + '/' + $routeParams.databaseID + '/' + authguid).success(function(data) {

			console.log(JSON.stringify(data));
			if(data.success){
				$scope.wrongGuid = false;
				//SET COOKIE AND GO BACK TO FORUM
				var cookieConfig = {
					path : '/',
					domain: "127.0.0.1", //'127.0.0.1' for DEV '.tessustats.ovh' for PRODUCTION
					expires : "Fri, 31 Dec 2025 23:59:59 GMT",
					secure : false
				};

				$cookies.put("authenticationGUID",authguid, cookieConfig);

				$location.url("/forum");


			}else{
				$scope.wrongGuid = true;
				$scope.wrongGuidReason = data.msg + " - " + JSON.stringify(data.error);
			}
			

		});

	};


	$scope.wrongGuid = false;
	$scope.updateData();

} ]);