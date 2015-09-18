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
		Highcharts.setOptions({
			global: {
				timezoneOffset: -180
			}
		});
		$scope.showChart = function (timeFrame) {
			$http.get("/query/serverActivityChart/" + timeFrame).success(function (data) {
				var soundsEnabledData = [];
				var micMutedData = [];
				var speakersMutedData = [];
				var lastDate;
				var scans = [];
				if (timeFrame == "month" || timeFrame == "week") {
					var daysData = [];
					data.split("\n").forEach(function (scan) {
						if (scan) {
							var columns = scan.split(",");
							var date = new Date(parseInt(columns[0]) * 1000);
							if (daysData.length == 0)
								daysData.push({
									date: date,
									data: {
										soundsEnabled: [parseInt(columns[1])],
										micMuted: [parseInt(columns[2])],
										speakersMuted: [parseInt(columns[3])]
									}
								});
							else
								if (daysData[daysData.length-1].date.getDate() == date.getDate() && daysData[daysData.length-1].date.getMonth() == date.getMonth()) {
									daysData[daysData.length-1].data.soundsEnabled.push(parseInt(columns[1]));
									daysData[daysData.length-1].data.micMuted.push(parseInt(columns[2]));
									daysData[daysData.length-1].data.speakersMuted.push(parseInt(columns[3]));
								} else {
									daysData.push({
										date: date,
										data: {
											soundsEnabled: [parseInt(columns[1])],
											micMuted: [parseInt(columns[2])],
											speakersMuted: [parseInt(columns[3])]
										}
									});
								}
						}
					});
					daysData.forEach(function (day) {
						function getLargest(dataSet) {
							var largest = 0;
							dataSet.forEach(function (item) {
								if (item > largest)
									largest = item;
							});
							return largest;
						}
						var timeStamp = Date.UTC(day.date.getUTCFullYear(), day.date.getUTCMonth()-1, day.date.getUTCDate(), day.date.getUTCHours(), day.date.getUTCMinutes());
						soundsEnabledData.push([timeStamp, getLargest(day.data.soundsEnabled)]);
						micMutedData.push([timeStamp, getLargest(day.data.micMuted)]);
						speakersMutedData.push([timeStamp, getLargest(day.data.speakersMuted)]);
					});
				} else {
					data.split("\n").forEach(function (scan) {
						if (scan) {
							var columns = scan.split(",");
							var date = new Date(parseInt(columns[0]) * 1000);
							date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth()-1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
							soundsEnabledData.push([date, parseInt(columns[1])]);
							micMutedData.push([date, parseInt(columns[2])]);
							speakersMutedData.push([date, parseInt(columns[3])]);
						}
					});
				}
				$('#serverchart').highcharts({
			        chart: {
			            type: 'area',
			            zoomType: "x"
			        },
			        title: {
			            text: 'Users online during last ' + timeFrame
			        },
			        xAxis: {
			            type: "datetime"           
			        },
			        yAxis: {
			            title: {
			                text: 'Users online'
			            }
			        },
			        tooltip: {
			        	shared: true,
			        	crosshairs: [true]
			        },
			        plotOptions: {
			        	area: {
			        		stacking: "normal",
			        		lineWidth: 1,
			        		marker: {
			        			radius: 1
			        		},
			        		states: {
			        			hover: {
			        				lineWidth: 1
			        			}
			        		}
			        	}
			        },
			        series: [{
			        	type: "area",
			        	name: "Sounds enabled",
			        	data: soundsEnabledData
			        },
			        {
			        	type: "area",
			        	name: "Mic muted",
			        	data: micMutedData
			        },
			        {
			        	type: "area",
			        	name: "Speakers and mic muted",
			        	data: speakersMutedData
			        }]
			    });
			});
		};
		$scope.showChart("day");
		//A function to change activity-chart's timeframe to 24 hours
		$scope.loadActivityGraphDay = function(){
			$scope.showChart("day");
		}
		//A function to change activity-chart's timeframe to 7 days
		$scope.loadActivityGraphWeek = function(){
			$scope.showChart("week");
		}
		//A function to change activity-chart's timeframe to 1 month
		$scope.loadActivityGraphMonth = function(){
			$scope.showChart("month");
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