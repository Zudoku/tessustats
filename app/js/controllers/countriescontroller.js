'use strict';

angular.module('tessustats.controller.countries', [])
.controller('countriesCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		
	$scope.updateData = function(){
		var countriesResource = $http.get('/query/countriespage').success(function(data) {
	    	$scope.countriesdata = data;
	    	$scope.setupChart();
		});
	};

	$scope.selectcountry=function(countrycode){
		$location.path('/country/'+countrycode);
	};
	$scope.getActivityPercent = function(activityScore){
		if($scope.countriesdata.combinedActivityScore == undefined){
			return "";
		}
		return parseFloat((activityScore / $scope.countriesdata.combinedActivityScore) * 100).toFixed(2);
	};
	$scope.getUsersPercent = function(userCount){
		if($scope.countriesdata.clientamount == undefined){
			return "";
		}
		return parseFloat((userCount / $scope.countriesdata.clientamount) * 100).toFixed(2);
	};

	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};



	$scope.setupChart = function(){


		$scope.countryActivityChartData = $scope.countriesdata.countries.map(function(value){
			var result = {
				country: value.country,
				countryLC : value.country.toLowerCase()
			};
			result.y = value.activityscore;
			return result;
		});

		$scope.countryUserChartData = $scope.countriesdata.countries.map(function(value){
			var result = {
				country: value.country,
				countryLC : value.country.toLowerCase()
			};
			result.y = value.users.length;
			return result;
		});

		$('#countryactivitychart').highcharts({
			    chart: {
            		plotBackgroundColor: null,
            		plotBorderWidth: null,
            		plotShadow: false,
            		type: 'pie'
        		},
			    title: {
			        text: ''
			    },
			    tooltip: {
            		pointFormat: '{point.country}: <b>{point.percentage:.1f}%</b>'
        		},
			    plotOptions: {
            		pie: {
                		allowPointSelect: true,
                		cursor: 'pointer',
                		dataLabels: {
                    		enabled: true,
                    		useHTML: true,
                    		format: '<span class="famfamfam-flag-{point.countryLC}"></span>' + '  : {point.percentage:.1f} %',
                    		style: {
                        		color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    		},
                		}
                	}
        		},
			    series: [{
			       	name: 'Countries',
            		colorByPoint: true,
			       	data: $scope.countryActivityChartData
			    }]
			});

		$('#countryuserchart').highcharts({
			    chart: {
            		plotBackgroundColor: null,
            		plotBorderWidth: null,
            		plotShadow: false,
            		type: 'pie'
        		},
			    title: {
			        text: ''
			    },
			    tooltip: {
            		pointFormat: '{point.country}: <b>{point.percentage:.1f}%</b>'
        		},
			    plotOptions: {
            		pie: {
                		allowPointSelect: true,
                		cursor: 'pointer',
                		dataLabels: {
                    		enabled: true,
                    		useHTML: true,
                    		format: '<span class="famfamfam-flag-{point.countryLC}"></span>' + '  : {point.percentage:.1f} %',
                    		style: {
                        		color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    		},
                		}
                	}
        		},
			    series: [{
			       	name: 'Countries',
            		colorByPoint: true,
			       	data: $scope.countryUserChartData
			    }]
			});
	};

	$scope.updateData();
		

} ]);