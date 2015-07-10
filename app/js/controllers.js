'use strict';

/* Controllers */

var ismultiple = function(number){
	if(number > 1){
		return 's';
	}
	else{
		return '';
	}
};

angular.module('myApp.controllers', [])


.controller('basicCtrl', ['$scope','$http','$location', function($scope, $http,$location) {

} ])
.controller('serverCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var serverResource = $http.get('/query/serverdata').success(function(data) {
		
		//Convert seconds to time
		var sec_num = data.uptime;
		
		
		var secondsInHour = (60 * 60);
		var secondsInDay = (secondsInHour * 24);
		
		
		var days    = Math.floor(sec_num / secondsInDay);
		var hours   = Math.floor((sec_num - days * secondsInDay) / secondsInHour);
	    var minutes = Math.floor((sec_num - days * secondsInDay - (hours * secondsInHour)) / 60);
	    var seconds = sec_num - days * secondsInDay - (hours * secondsInHour) - (minutes * 60);
	    
	    var dayString = (days === 0)? '' : days + ' day' + ismultiple(days) + ' ';
	    var hourString = (hours === 0)? '' : hours + ' hour' + ismultiple(hours) + ' ';
	    var minuteString = (minutes === 0)? '' : minutes + ' minute' + ismultiple(minutes) + ' ';
	    var secondString = (seconds === 0)? '' : seconds + ' second' + ismultiple(seconds) + ' ';
	    
	    data.uptime = dayString + hourString + minuteString + secondString;

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
		$scope.showChart()
		
		$scope.loadActivityGraphDay = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/day',
				unload: true          
			
			});
		}
		$scope.loadActivityGraphWeek = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/week',
				unload: true          
			
			});
		}
		$scope.loadActivityGraphMonth = function(){
			$scope.chart.load({
				url: '/query/serverActivityChart/month',
				unload: true          
			
			});
		}

		
		
		var lastScanResource = $http.get('/query/lastscan').success(function(data) {
			var scanDate = moment.utc(data.date).toDate();
			
			data.dateFormatted = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
			$scope.lastScan = data;
			$scope.lastScanStyle = (data.success === 'Online')? 'success' : 'danger';
			
		});
		var lastScanClients = $http.get('/query/lastscanclients').success(function(data) {
			$scope.usersOnlineNow = data.length;
		});
		
		var lastScanClients = $http.get('/query/getmostclientsseen').success(function(data) {
			$scope.mostclientsseen = data;
			var scanDate = moment.utc(data.date).toDate();
			
			$scope.mostclientsseen.date = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
		});
		
	});
	
	
} ])
.controller('usersCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
	var userResource = $http.get('/query/allusers').success(function(usersdata) {
		
		var lastScanClients = $http.get('/query/lastscanclients').success(function(data) {
			$scope.users = usersdata;
			//Go through all the clients that were in the last scan
			for(var index = 0 ; index < data.length ; index++){
				var handledClient = data[index];
				//Find the client that has the same name
				for(var allusersIndex = 0 ; allusersIndex < usersdata.length ; allusersIndex++){
					if(usersdata[allusersIndex].databaseid === handledClient.databaseid){
						//If it also has same name, give it green text
						if(usersdata[allusersIndex].nickname === handledClient.nickname){
							$scope.users[allusersIndex].textcolor = 'success';
							console.log($scope.users[allusersIndex].textcolor);
						}else{ //If only same databaseid, name has changed. Yellow text instead
							$scope.users[allusersIndex].textcolor = 'warning';
							console.log($scope.users[allusersIndex].textcolor);
						}
					}
				}
			}
			
		});
		
	});
	
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};

} ])


.controller('countriesCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/query/allcountries').success(function(data) {
			$scope.countries = data;
		});

		$scope.selectcountry=function(countrycode){

			$location.path('/country/'+countrycode);
		};

} ])

.controller('countryCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var countryResource = $http.get('/query/country/'+$routeParams.countrycode).success(function(data) {
			$scope.country = data;

		})

} ])

.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var countryResource = $http.get('/query/allchannels').success(function(data) {
			$scope.channels = data
		})

		$scope.selectchannel=function(channelname){

			$location.path('/channel/'+channelname);
		}

} ])

.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var channelResource = $http.get('/query/channel/'+$routeParams.channelid).success(function(data) {
			$scope.channel = data;

		})

} ])

.controller('userCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
	var userResource = $http.get('/query/user/'+$routeParams.databaseid).success(function(data) {
		$scope.user = data;
		var recordResource = $http.get('/query/latestrecord/'+$routeParams.databaseid).success(function(record) {
			var scanDate = moment.utc(record.date).toDate();
			record.date = scanDate.toLocaleString();//moment(scanDate).format('YYYY-MM-DD HH:mm:ss');
			$scope.record = record;
			$scope.record.inputmutedstring = (record.inputmuted === 1) ? 'Muted' : 'On' ;
			$scope.record.outputmutedstring = (record.outputmuted === 1) ? 'Muted' : 'On' ;
			
		});
		var lastscanclients = $http.get('/query/lastscanclients').success(function(lastscan) {
			for(var index = 0; index < lastscan.length ; index++){
				if(lastscan[index].databaseid === $scope.user.databaseid){
					$scope.onlineRightNow = 'Online!';
					$scope.onlineClass = 'text-success';
				}
			}
			if($scope.onlineRightNow != 'Online!'){
				$scope.onlineRightNow = 'offline';
				$scope.onlineClass = 'text-warning';
			}
		});

	});
	var allusers = $http.get('/query/allusers').success(function(allusers) {
		var foundAllUsersRecord = undefined;
		for(var index = 0 ; index < allusers.length; index++){
			var handled = allusers[index];
			var routeparams = undefined;
			try{
				routeparams = parseInt($routeParams.databaseid);
			}catch(error){

			}
			if(handled.databaseid === routeparams){
				handled.activityrank = ++index;
				foundAllUsersRecord = handled;

				break;
			}
		}

		$scope.allusersrecord = foundAllUsersRecord;
	});
	
	
} ]);
