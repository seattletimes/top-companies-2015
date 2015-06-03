//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");
require("angular");

var Share = require("share");

new Share(".share");
new Share(".share-bottom", {
  ui: {
    flyout: "top left"
  }
});

var app = angular.module("top-companies", []);

app.filter("illions", ["$filter", function($filter){
  var format = $filter("number");
  return function(number) {
    var display;
    if (number > 999) {
      display = format(number/1000, 1) + " B";
    } else {
      display = number + " M";
    }
    display = "$" + display;
    return display.replace(/\$\-/, "-$");
  }
}]);

app.controller("CompanyController", ["$scope", function($scope) {
  $scope.companies = companyData;
  $scope.industries = ["Banking", "Biotechnology/biomed.", "Business services", "Communications/media", "Computer hardware", "Computer software/srvcs.", "Consumer products", "Forest products", "Insurance", "Manufacturing", "Mining", "Retail", "Semiconductors & equip.", "Telecommunications", "Travel & transportation", "Utilities"].sort();
  $scope.filterBy = "all";

  $scope.industryFilter = function(value) {
      if ($scope.filterBy == "all") return true;
      return value.industry == $scope.filterBy;
    }

  $scope.headers = [
    { title: "Rank", short: "rank" },
    { title: "Company", short: "company" },
    { title: "Industry", short: "industry" },
    { title: "ROIC", short: "roic" },
    { title: "Market Cap", short: "marketcap" },
    { title: "Free Cash Flow", short: "freecashflow" },
    { title: "Sales", short: "sales" },
    { title: "Profits", short: "profits" },
    { title: "Profit / Loss %", short: "profitlossperc" },
    { title: "ROA", short: "roa" },
    { title: "Employees", short: "employees" },
    { title: "P-E (YOY)", short: "peyoy" }
    ];
  $scope.lastSort = $scope.headers[0];
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

var qsa = function(s) { return Array.prototype.slice.call(document.querySelectorAll(s)) };

var images = qsa("img.fixable");
var dest = document.querySelector(".fixed-frame");
var sections = qsa(".parallax-play");

var dots = document.createElement("ul");
dots.className = "dots";

var indexed = [];

images.forEach(function(img, i) {
  var index = img.parentElement.getAttribute("data-index");
  indexed[index * 1] = img;
  if (!i) img.setAttribute("visible", "");
  dest.appendChild(img);
  var dot = document.createElement("li");
  dot.className = "dot";
  dots.appendChild(dot);
});

dest.appendChild(dots);

var debounce = function(f, d) {
  d = d || 100;
  var timeout = null;
  return function() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    if (timeout) return;
    timeout = setTimeout(function() {
      timeout = null;
      f.apply(null, args);
    }, d);
  };
};

window.addEventListener("scroll", debounce(function(e) {
  var activeDot = dots.querySelector(".active");
  if (activeDot) activeDot.className = activeDot.className.replace(/active/g, "");
  var lastVisible = 1;

  for (var i = 1; i < sections.length; i++) {
    var section = sections[i];
    var bounds = section.getBoundingClientRect();
    if (bounds.top <= window.innerHeight) {
      indexed[i].setAttribute("visible", "");
      lastVisible = i + 1;
    } else {
      indexed[i].removeAttribute("visible");
    }
  }

  dots.querySelector(".dot:nth-child(" + lastVisible + ")").className += " active";
}));

document.querySelector("aside.no-mobile-portrait .ok").addEventListener("click", function() {
  document.body.className += " hide-warning";
})