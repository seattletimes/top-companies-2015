//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");
require("angular");

var app = angular.module("top-companies", []);

app.controller("CompanyController", ["$scope", function($scope) {
  $scope.companies = companyData;
  $scope.headers = [
    { title: "Rank", short: "rank" },
    { title: "Company", short: "company" },
    { title: "", short: "industry" },
    { title: "ROIC", short: "roic" },
    { title: "Market Cap", short: "marketcap" },
    { title: "Free Cash Flow", short: "freecashflow" },
    { title: "Sales", short: "sales" },
    { title: "Profits", short: "profits" },
    { title: "Profit/Loss %", short: "profitlossperc" },
    { title: "ROA", short: "roa" },
    { title: "Employees", short: "employees" },
    { title: "P-E (YOY)", short: "peyoy" }
    ];
  $scope.lastSort = null;
  $scope.sortOrder = 1;

  $scope.sortTable = function(header) {
    if ($scope.lastSort == null ) { var first = true }
    if ($scope.lastSort == header) { 
      $scope.sortOrder *= -1;
    } else {
      $scope.lastSort = header;
      $scope.sortOrder = 1;
    }

    $scope.companies.sort(function(a, b) {
      a = typeof a[header.short] == "number" ? a[header.short] * -1 : a[header.short].toLowerCase();
      b = typeof b[header.short] == "number" ? b[header.short] * -1 : b[header.short].toLowerCase();
      if (header.short == "rank") {
        a = a * -1;
        b = b * -1;
      }
      if (a < b) {
        return -1 * $scope.sortOrder;
      } else if (a > b) {
        return 1 * $scope.sortOrder;
      } else if (a == b) {
        return 0;
      }
    });
  };
}]);