'use strict';


// Declare app level module which depends on filters, and services
angular.module('tessustats', [
  'ngRoute',
  'ngCookies',
  'tessustats.controllers',
  'tessustats.filters',
  'tessustats.services',
  'tessustats.directives',
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
  //FORUMS
  $routeProvider.when('/forum', {templateUrl: 'partials/forumview.html', controller: 'forumviewCtrl'});
  $routeProvider.when('/forum/post/:postID', {templateUrl: 'partials/forumpost.html', controller: 'forumpostCtrl'});
  $routeProvider.when('/forum/newpost/', {templateUrl: 'partials/forumpostnew.html', controller: 'forumpostnewCtrl'});
  $routeProvider.when('/registration/confirm/:uniqueID/:databaseID', {templateUrl: 'partials/forumconfirmregister.html', controller: 'forumconfirmCtrl'});
  //FRONT PAGE
  $routeProvider.otherwise({templateUrl: 'partials/front.html', controller: 'basicCtrl'});
}]);
 