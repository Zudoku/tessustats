'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/index', {templateUrl: 'partials/front.html', controller: 'MyCtrl1'});
  $routeProvider.when('/server', {templateUrl: 'partials/server.html', controller: 'MyCtrl1'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'usersCtrl'});
  $routeProvider.when('/user/:databaseid', {templateUrl: 'partials/user.html', controller: 'userCtrl'});
  $routeProvider.otherwise({templateUrl: 'partials/front.html', controller: 'MyCtrl1'});
}]);
