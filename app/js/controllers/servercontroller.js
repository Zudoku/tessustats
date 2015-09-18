'use strict';

angular.module('tessustats.controller.server', [])
.controller('serverCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	//Query the server data
	var serverResource = $http.get('/query/serverdata').success(function(data) {
		
		//Convert seconds to human readable
		var sec_num = data.uptime;
	    data.uptime = getTimeFromSeconds(sec_num)

		$scope.serverdata = data;
		$scope.mostClientsTooltip = function(){
			console.log("mouse over");
			$('#mostclienttime').tooltip();
			
		};
		
		$scope.chart = null
		$scope.showChart = function(){
			console.log("showing chart");
			$scope.chart = c3.generate({
				bindto: '#serverchart',
			  	data: {
			  		url: '/query/serverActivityChart/day',
					type: 'bar',
					groups: [
					            ['0','1','2']
					],
					names : {
					    0: 'Active',
					    1: 'Microphone muted',
					    2: 'Speakers and headphones muted'
					},
					x : 'time',
			  	},
			  	axis: {
			  	  x: {
			  	    localtime: true,
			  	  	tick: {
			  	  		format: function (x) { 
			  	  			var date = new Date(x*1000);
			  	  			return date.toLocaleString();
			  	  		}
			  	    },
			  	    show: false
			  	  }
			  	},
			  	padding: {
			  	  bottom: 40
			  	},
			  	size: {
			  	  height: 440
			  	}
			});
		};
		//Load the chart on page load too.
		$scope.showChart() 
		//A function to change activity-chart's timeframe to 24 hours
		$scope.loadActivityGraphDay = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/day',
				unload: true          
			
			});
		}
		//A function to change activity-chart's timeframe to 7 days
		$scope.loadActivityGraphWeek = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/week',
				unload: true          
			
			});
		}
		//A function to change activity-chart's timeframe to 1 month
		$scope.loadActivityGraphMonth = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/month',
				unload: true          
			
			});
		}
		//Query the last scan time
		var lastScanResource = $http.get('/query/lastscan').success(function(data) {
			var scanDate = moment.utc(data[0].date).toDate();
			var scanEndDate = moment.utc(data[1].date).toDate();
			var nextDate = new Date((scanEndDate.getTime() + (60 * 5 * 1000)));
			data.dateFormatted = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
			$scope.lastScan = data;
			$scope.nextDate = nextDate;
			$scope.lastScanStyle = (data[0].success === 'Online')? 'success' : 'danger';
			
		});
		
		$scope.getTimeToNextScan = function(){
			var nowDate = new Date();
			if($scope.nextDate == undefined){
				return "";
			}
			var scanDate = $scope.nextDate;
			var millisecondsToScan = scanDate.getTime() - nowDate.getTime();
			if(millisecondsToScan < 0){
				return "Scanning... it may take a while";
			}
			return getTimeFromSeconds(Math.ceil(millisecondsToScan/1000));
			
		};
		//Query the amount of users online in the latest scan
		var lastScanClients = $http.get('/query/lastscanclients').success(function(data) {
			$scope.usersOnlineNow = data.length;
		});
		//Query the amount of users has ever been in server
		var lastScanClients = $http.get('/query/getmostclientsseen').success(function(data) {
			$scope.mostclientsseen = data;
			var scanDate = moment.utc(data.date).toDate();
			
			$scope.mostclientsseen.date = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
		});
		
		var allScanClients = $http.get('/query/usersAmount').success(function(data) {
			$scope.uniqueVisitors = data.users;
		});
		var allScans = $http.get('/query/scansAmount').success(function(data) {
			$scope.scanAmount = data.scans;
		});
		var activeChannelsResource = $http.get('/query/activeChannelsAmount').success(function(data) {
			$scope.activeChannels = data.channels;
			var inActiveChannels = $http.get('/query/channelsAmount').success(function(data) {
				$scope.channelsAmount = data.channels;
			});
		});
		
	});
	
	$scope.getNavigationClass = function(page){
		console.log(page);
		if(page == 'server'){
			return "active";
		}
		return "";
	}
	
	
} ]);