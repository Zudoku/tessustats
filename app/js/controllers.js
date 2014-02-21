'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/allusers').success(function(data) {
		$scope.users = data
	})
	
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	}

} ])

.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
	var userResource = $http.get('/user/'+$routeParams.databaseid).success(function(data) {
		$scope.user = data;
	})
	
} ]);
