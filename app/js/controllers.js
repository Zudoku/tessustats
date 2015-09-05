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
/**
 * Convert number of seconds to "X days Y hours Z minutes F seconds" String
 */
var getTimeFromSeconds = function(sec_num){
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
    
    return (dayString + hourString + minuteString + secondString);
	
	
};

angular.module('myApp.controllers', [])


.controller('basicCtrl', ['$scope','$http','$location', function($scope, $http,$location) {

} ]) //Angular Controller for the server page
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
						}else{ //If only same databaseid, name has changed. Yellow text instead
							$scope.users[allusersIndex].textcolor = 'warning';
						}
					}
				}
			}
			
		});
		
	});
	var countriesResource = $http.get('/query/getAllUsersCountry').success(function(countriesData) {
		$scope.usercountries = countriesData;
	});
	var allScanClientsResource = $http.get('/query/usersAmount').success(function(data) {
		$scope.uniqueVisitors = data.users;
	});
	
	
	
	$scope.getCountry = function(clientid){
		if($scope.usercountries == undefined){
			return "";
		}
		for(var t = 0; t<$scope.usercountries.length ; t++){
			if($scope.usercountries[t].databaseid == clientid){
				return $scope.usercountries[t].country;
			}
		}
	}
	
	//Function for clicking the user in the list
	$scope.selectuser=function(clientid){
		
		$location.path('/user/'+clientid);
	};
	
	$scope.selectCountry = function(country){
		$location.path('/country/'+country);
	};

} ])


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
		

} ])

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

} ])

.controller('channelsCtrl', ['$scope','$http','$location', function($scope, $http,$location) {
		var activeChannelResource = $http.get('/query/getAllActiveChannels').success(function(data) {
			$scope.activeChannels = data
		});
		
		
		$scope.selectChannel=function(channelname){

			$location.path('/channel/'+channelname);
		}
		$scope.handleChannels = function(){
			var channels = $scope.activeChannels;
			if(channels == undefined){
				return [];
			}
			
			var result = [];
			for(var y=0;y < channels.length; y++){
				if(channels[y].children == undefined){
					result.push(channels[y]);
				}else{
					var children = channels[y].children;
					//channels[y].children = undefined;
					result.push(channels[y]);
					
					for(var h= 0; h < children.length; h++){
						children[h].style="sub";
						result.push(children[h]);
					}
				}
			}
			$scope.handledChannels = result;
			return result;
		};
		$scope.passwordChannel = function(passwordprotected){
			if(passwordprotected == 0){
				return true;
			}else{
				return false;
			}
		};
		var lastScanClientsResource = $http.get('/query/lastscanclients').success(function(data) {
			var channelLastClientsList = [];
			var channelsPopulated = [];
			for(var y=0; y < data.length; y++){
				var client = data[y];
				if(channelsPopulated.indexOf(client.channel) == -1){
					channelsPopulated.push(client.channel);
					var channel = {
							cid : client.channel,
							clients : []
					};
					channel.clients.push(client);
					channelLastClientsList.push(channel);
				}else{
					for(var i = 0 ; i < channelLastClientsList.length; i++){
						if(channelLastClientsList[i].cid == client.channel){
							channelLastClientsList[i].clients.push(client);
							break;
						}
					}
				}
			}
			$scope.lastScan = channelLastClientsList;
		});

		
		$scope.getChannelData = function(cid){
			var lastScan = $scope.lastScan;
			if(lastScan == undefined){
				return;
			}
			for(var y=0; y < lastScan.length; y++){
				if(lastScan[y].cid == cid){
					return lastScan[y];
				}
			}
			return;
		};
		$scope.getTimeFromSeconds = function(seconds){
			return getTimeFromSeconds(seconds);
		};
		$scope.getTemporaryStyle = function(cid){
			for(var t =0 ; t < $scope.handledChannels.length ; t++){
				if(cid == $scope.handledChannels[t].cid && $scope.handledChannels[t].type == "Temporary"){
					return "warning";
				}
			}
			return "";
		};
} ])

.controller('channelCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {
		var channelResource = $http.get('/query/channel/'+$routeParams.channelid).success(function(data) {
			$scope.channel = data;
			$scope.passwordString = ($scope.channel.passwordprotected == 0) ? "No password protection": "Password protection";
			$scope.encryptionString = ($scope.channel.encryptedvoice == 0) ? "No voice encryption": "Voice encryption";
			if($scope.channel.secondsempty == -1){
				$scope.activity = "Active";
			}else{
				$scope.activity = "Empty for " + getTimeFromSeconds($scope.channel.secondsempty);
			}
			$scope.encryptionString = ($scope.channel.encryptedvoice == 0) ? "No voice encryption": "Voice encryption";
			
			
			
		});

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
			
			var channelName = $http.get('/query/channelname/' + record.channel).success(function(channelName) {
				$scope.channelName = channelName.name;
			});
			
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
