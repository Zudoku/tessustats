'use strict';

angular.module('tessustats.controller.country', [])
.controller('countryCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var countryResource = $http.get('/query/allcountries').success(function(data) {
			
			for(var x = 0; x < data.length; x++){
				if(data[x].country == $routeParams.countrycode){
					$scope.country = data[x];
					$scope.rank = (x + 1);
					var usersResource = $http.get('/query/allusers').success(function(alluserdata) {
						var allusers = alluserdata.length
						$scope.allusers = allusers;
						$scope.userspercent = parseFloat(($scope.country.users.length / allusers) * 100).toFixed(2);
					});
					var activityScoreResource = $http.get('/query/combinedActivityScore').success(function(data) {
						$scope.activityScoreCombined = data.times;
						$scope.activitypercent = parseFloat(($scope.country.activityscore / $scope.activityScoreCombined) * 100).toFixed(2);
					});
					break;
				}
			}
		});
		var usersResource = $http.get('/query/allClientsFromCountry/' + $routeParams.countrycode).success(function(data) {
			$scope.usersFromCountry = data;
		});
		
		
		$scope.selectUser = function(databaseid){
			$location.path('/user/'+databaseid);
		};

} ]);