'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/index', {templateUrl: 'partials/front.html', controller: 'basicCtrl'});
  //SERVER
  $routeProvider.when('/server', {templateUrl: 'partials/server.html', controller: 'serverCtrl'});
  //USER
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'usersCtrl'});
  $routeProvider.when('/user/:databaseid', {templateUrl: 'partials/user.html', controller: 'userCtrl'});
  //CHANNEL
  $routeProvider.when('/channels', {templateUrl: 'partials/channels.html', controller: 'channelsCtrl'});
  $routeProvider.when('/channel/:channelid', {templateUrl: 'partials/channel.html', controller: 'channelCtrl'});
  //COUNTRY
  $routeProvider.when('/countries', {templateUrl: 'partials/countries.html', controller: 'countriesCtrl'});
  $routeProvider.when('/country/:countrycode', {templateUrl: 'partials/country.html', controller: 'countryCtrl'});
  //ABOUT
  $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'basicCtrl'});
  //FRONT PAGE
  $routeProvider.otherwise({templateUrl: 'partials/front.html', controller: 'basicCtrl'});
}]);
