'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('tessustats.services', 
	[
	'tessustats.services'
	])
.factory('getTimeFromSeconds',function(sec_num) {

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
  });
