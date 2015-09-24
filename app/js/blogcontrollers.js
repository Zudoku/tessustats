'use strict';

angular.module('blog.controllers', [])


.controller('basicCtrl', ['$scope','$http','$location','$routeParams', function($scope, $http,$location,$routeParams) {

} ])
.controller('articleListCtrl', ['$scope','$http','$location','$routeParams','$sce', function($scope, $http,$location,$routeParams,$sce) {
	$scope.needIntroduction = function(){
		if($routeParams.page == undefined || $routeParams.page == 0){
			return false;
		}
		return true;
	};
	function isInt(n){
		return Number(n) === n && n % 1 === 0 ;
	}
	
	var page = 0;
	if($routeParams.page != undefined && isInt($routeParams.page)){
		page = $routeParams.page;
	}
	$scope.articles = [];
	var articleListResource = $http.get('/query/blog/articleList').success(function(data) {
		var articlesToShow = [];
		for(var i = 0; i < 10; i++){
			if((page*10 + i) < data.length){
				articlesToShow.push(data[page*10 + i].id);
			}
		}
		for(var i = 0; i < articlesToShow.length; i++){
			var articleResource = $http.get('/query/blog/article/' + articlesToShow[i]).success(function(data) {
				var safedata = data;
				safedata.article = $sce.trustAsHtml(data.article);
				$scope.articles.push(safedata);
			});
		}
	});
	
	
} ])
.controller('articleCtrl', ['$scope','$http','$location','$routeParams','$sce', function($scope, $http,$location,$routeParams,$sce) {
	var articleResource = $http.get('/query/blog/article/' + $routeParams.id).success(function(data) {
		$scope.article = data;
		$scope.article.article = $sce.trustAsHtml(data.article);
	});
} ]);
