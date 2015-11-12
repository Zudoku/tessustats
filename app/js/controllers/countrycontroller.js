'use strict';

angular.module('tessustats.controller.country', [])
.controller('countryCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {

	$scope.updateData = function(){
		var countriesResource = $http.get('/query/countrypage/' + $routeParams.countrycode).success(function(data) {
	    	$scope.countriesdata = data;
		});
	};
	$scope.getActivityPercent = function(activityScore){
		if($scope.countriesdata == undefined || $scope.countriesdata.combinedActivityScore == undefined){
			return "";
		}
		return parseFloat((activityScore / $scope.countriesdata.combinedActivityScore) * 100).toFixed(2);
	};
	$scope.getUsersPercent = function(userCount){
		if($scope.countriesdata == undefined || $scope.countriesdata.clientamount == undefined){
			return "";
		}
		return parseFloat((userCount / $scope.countriesdata.clientamount) * 100).toFixed(2);
	};

	$scope.selectUser = function(databaseid){
		$location.path('/user/'+databaseid);
	};

	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};

	$scope.updateData();
		

} ]);