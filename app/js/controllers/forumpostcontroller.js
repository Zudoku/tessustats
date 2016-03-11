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

		postCommentQuery.success(function(data) {
			$scope.sending = false;
			if(data.success){
				$scope.newComment = "";
				$scope.comments.push(data.commentData);
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
			console.log(JSON.stringify(data));
	    	if(data.success){
	    		$scope.authentication = data.row;
	    		$scope.forumModerator = data.forumModerator;
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
	};

	$scope.canMonitorPost = function(){
		if($scope.forumModerator){ //If moderator
			return true;
		} else if ($scope.authentication != null && $scope.post != undefined && $scope.authentication.databaseID == $scope.post.creator) { //If own post
			return true
		} else {
			return false;
		}
	};

	$scope.canMonitorComment = function(comment){
		if($scope.forumModerator){ //If moderator
			return true;
		} else if ($scope.authentication != null &&  $scope.authentication.databaseID == comment.commenter) { //If own comment
			return true
		} else {
			return false;
		}
	};

	$scope.deleteComment = function(comment){
		if(comment == undefined) {
			return;
		}
		if(!confirm("Are you sure you want to delete this comment?")){
			return;
		}

		var deleteCommentBody = {
			authentication : $scope.authentication.authguid,
			comment : comment
		};
		var deleteCommentQuery = $http.post('/forum/deleteComment',deleteCommentBody).success(function(data) {
	    	if(data.success){
	    		$scope.comments.splice($scope.comments.indexOf(comment),1);
	    		return ;
	    	}else{
	    		alert(JSON.stringify(data));
	    	}
		});

	};

	$scope.deletePost = function(){

		if(!confirm("Are you sure you want to delete this post?")){
			return;
		}

		var deletePostBody = {
			authentication : $scope.authentication.authguid,
			post : $scope.post.ID
		};
		var deletePostQuery = $http.post('/forum/deletePost',deletePostBody).success(function(data) {
	    	if(data.success){
	    		$location.url("/forum");
	    		return ;
	    	}else{
	    		alert(JSON.stringify(data));
	    	}
		});
	};

	$scope.forumModerator = false;
	$scope.nameBank = {};
	$scope.updateData();
	$scope.isLoggedIn();

} ]);