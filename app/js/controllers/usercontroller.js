'use strict';

angular.module('tessustats.controller.user', [])
.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {


	$scope.updateData = function(){
		var serverResource = $http.get('/query/userpage/' + $routeParams.databaseid).success(function(data) {
			console.log(data);
	    	//Making  things pretty for user
	    	data.info.countrycode = data.info.country.toLowerCase();
	    	if(data.isonline){
	    		data.info.onlinetext = "online";
	    		$scope.onlineClass = 'text-success';
	    	}else{
	    		data.info.onlinetext = "offline";
	    		$scope.onlineClass = 'text-warning';
	    	}
	    	var scanDate = moment.utc(data.userlastrecord.date).toDate();
	    	data.userlastrecord.dateFormatted = scanDate.toLocaleString();


	    	$scope.userinfo = data;
	    	$scope.setupChart();
		});
	};
	$scope.updateData();

	$scope.setupChart = function(){
		$('#userchart').highcharts({
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
            		pointFormat: '{series.channelname}: <b>{point.percentage:.1f}%</b>'
        		},
			    plotOptions: {
            		pie: {
                		allowPointSelect: true,
                		cursor: 'pointer',
                		dataLabels: {
                    		enabled: true,
                    		format: '<b>{point.channelname}</b>: {point.percentage:.1f} %',
                    		style: {
                        		color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    		}
                		}
                	}
        		},
			    series: [{
			       	name: 'Channels',
            		colorByPoint: true,
			       	data: $scope.userinfo.piechart
			    }]
			});
	};


	$scope.getMutedText = function(value) {
		return (value === 1) ? 'Muted' : 'On' ;
	};

	$scope.getTimeFromSeconds = function(seconds){
		return getTimeFromSeconds(seconds);
	};

	
	
} ]);