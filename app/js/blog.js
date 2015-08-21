'use strict';


angular.module('blog', [
  'ngRoute',
  'blog.controllers'
]).config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/index/:page?', {templateUrl: 'personal/articleListing.html', controller: 'articleListCtrl'});
  
  $routeProvider.when('/article/:id', {templateUrl: 'personal/article.html', controller: 'articleCtrl'});
  
  $routeProvider.otherwise({templateUrl: 'personal/articleListing.html', controller: 'articleListCtrl'});
}]);
