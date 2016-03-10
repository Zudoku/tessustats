'use strict';

angular.module('tessustats.controller.forumpostnew', [])
.controller('forumpostnewCtrl', ['$scope','$http','$location','$routeParams','$cookies', function($scope, $http,$location,$routeParams,$cookies) {

	$scope.updateData = function(){
		//var forumpostsResource = $http.get('/query/forumView/').success(function(data) {
	    //	$scope.x = data;
		//});
	};
	
	$scope.sendNewPost = function(){

		$scope.sending = true;
		var registerQuery = $http.post('/forum/newPost',$scope.post);

		registerQuery.success(function(data) {
			$scope.sending = false;

			if(data.success){
				$location.url("/forum/post/" + data.postID);
			} else {
				$scope.error = true;
				$scope.errorMessage = data.message;
			}

			console.log(JSON.stringify(data));
		});

		registerQuery.error(function(data) {
			$scope.sending = false;
			console.log(JSON.stringify(data));
		});

	};


	$scope.isLoggedIn = function() {

		var authGuid = $cookies.get("authenticationGUID");

		if(authGuid == undefined) {
			return false;
		}
		var forumpostsResource = $http.get('/query/forum/auth/' + authGuid).success(function(data) {
			
	    	if(data.success){
	    		$scope.post.authentication = data.row.authguid;
	    		$scope.loggedInUser = true;
	    		return true;
	    	}else{
	    		return false;
	    	}
		});



	};

	$scope.sending = false;
	$scope.post = { category : "Social" };
	$scope.updateData();
	$scope.isLoggedIn();

} ]);