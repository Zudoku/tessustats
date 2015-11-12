'use strict';

angular.module('tessustats.controller.server', [])
.controller('serverCtrl', ['$scope','$http','$location', function($scope, $http,$location) {



	$scope.updateData = function(){
		var serverResource = $http.get('/query/serverpage').success(function(data) {
			var sec_num = data.basicinfo.uptime;
	    	data.uptime = getTimeFromSeconds(sec_num);

	    	//Making  things pretty for user

	    	//Last scan
	    	var scanDate = moment.utc(data.lastscan[0].date).toDate();
			var scanEndDate = moment.utc(data.lastscan[1].date).toDate();
			var nextDate = new Date((scanEndDate.getTime() + (60 * 5 * 1000))); //5 Minutes 

			data.lastscaninfo = {
				dateFormatted : scanDate.toLocaleString(),
				nextDate : nextDate,
				lastScanStyle : (data.lastscan[0].success === 'Online')? 'success' : 'danger'
			};
			//Most clients
			scanDate = moment.utc(data.mostclients.date).toDate();
			data.mostclients.formatdate = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');


	    	$scope.serverdata = data;
		});
	};

	$scope.mostClientsTooltip = function(){
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

	$scope.getTimeToNextScan = function(){
		var nowDate = new Date();
		if($scope.serverdata == undefined || $scope.serverdata.lastscaninfo.nextDate == undefined){
			return "";
		}
		var scanDate = $scope.serverdata.lastscaninfo.nextDate;
		var millisecondsToScan = scanDate.getTime() - nowDate.getTime();
		if(millisecondsToScan < 0){
			return "Scanning... it may take a while";
		}
		return getTimeFromSeconds(Math.ceil(millisecondsToScan/1000));
	};
	
	$scope.getNavigationClass = function(page){
		if(page == 'server'){
			return "active";
		}
		return "";
	};

	$scope.updateData();
	
	
} ]);