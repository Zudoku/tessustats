'use strict';

angular.module('tessustats.controller.countries', [])
.controller('countriesCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/query/allcountries').success(function(data) {
			$scope.countries = data;
		});
		var activityScoreResource = $http.get('/query/combinedActivityScore').success(function(data) {
			$scope.activityScoreCombined = data.times;
		});
		var usersAmountResource = $http.get('/query/usersAmount').success(function(data) {
			$scope.usersAmount = data.users;
		});
		$scope.selectcountry=function(countrycode){

			$location.path('/country/'+countrycode);
		};
		$scope.getActivityPercent = function(activityScore){
			if($scope.activityScoreCombined == undefined){
				return "";
			}
			return parseFloat((activityScore / $scope.activityScoreCombined) * 100).toFixed(2);
		};
		$scope.getUsersPercent = function(userCount){
			if($scope.usersAmount == undefined){
				return "";
			}
			return parseFloat((userCount / $scope.usersAmount) * 100).toFixed(2);
		};
		

} ]);