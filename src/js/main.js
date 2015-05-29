//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");
require("angular");

var app = angular.module("top-companies", []);

app.controller("CompanyController", ["$scope", function($scope) {
  $scope.companies = companyData;
}]);