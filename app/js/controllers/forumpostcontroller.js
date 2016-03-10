'use strict';

angular.module('tessustats.controller.forumpost', [])
.controller('forumpostCtrl', ['$scope','$http','$location','$routeParams','$cookies', function($scope, $http,$location,$routeParams,$cookies) {

	$scope.updateData = function(){
		var forumpostResource = $http.post('/query/forum/post/' + $routeParams.postID,{ authguid : $scope.authentication }).success(function(data) {
	    	$scope.post = data.forumPost;
	    	$scope.editable = data.editable;
	    	$scope.comments = data.comments;


	    	var ids = [];
	    	ids.push($scope.post.creator);
	    	for(var y = 0 ; y < data.comments.length; y++) {
	    		if(ids.indexOf(data.comments[y].commenter) == -1){
	    			ids.push(data.comments[y].commenter);
	    		}
	    	}

	    	$scope.checkOutNamesFor(ids);



		});
	};
	
	$scope.postComment = function(){

		$scope.sending = true;


		var commentObject = {
			comment : $scope.newComment,
			postID : $routeParams.postID,
			authentication : $scope.authentication
		};


		var postCommentQuery = $http.post('/forum/newComment',commentObject);

		postComment.success(function(data) {
			$scope.sending = false;

			if(data.success){
				$location.url("/forum/post/" + data.postID);
			} else {
				$scope.error = true;
				$scope.errorMessage = data.message;
			}

			console.log(JSON.stringify(data));
		});

		postCommentQuery.error(function(data) {
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
	    		$scope.authentication = data.row;
	    		$scope.loggedInUser = true;
	    		return true;
	    	}else{
	    		return false;
	    	}
		});



	};

	$scope.checkOutNamesFor = function(ids){
		console.log(JSON.stringify(ids));
		if(ids == undefined){
			return;
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

	$scope.getNameFor = function(ID){
		if( $scope.nameBank[ID] == undefined) {
			return "" + ID;
		}else {
			return $scope.nameBank[ID].nickname;
		}
		
	};
	$scope.getTime = function(time){
		var timeDate = new Date(time);
		return timeDate.toLocaleString();
	}


	$scope.nameBank = {};
	$scope.updateData();
	$scope.isLoggedIn();

} ]);