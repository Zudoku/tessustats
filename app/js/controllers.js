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

angular.module('tessustats.controllers', 
	[
	'tessustats.controller.user',
	'tessustats.controller.users',
	'tessustats.controller.server',
	'tessustats.controller.country',
	'tessustats.controller.countries',
	'tessustats.controller.channel',
	'tessustats.controller.channels',
	'tessustats.controller.forumView',
	'tessustats.controller.forumpostnew',
	'tessustats.controller.forumpost',
	'tessustats.controller.forumconfirm'
	])


.controller('basicCtrl', ['$scope','$http','$location', function($scope, $http,$location) {

} ]);
