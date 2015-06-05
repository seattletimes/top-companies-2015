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

app.directive("sticky", function(){
  var stuck = [];

  var check = function() {
    stuck.forEach(function(element) {
      element.classList.remove("fixed");
      var bounds = element.getBoundingClientRect();
      if (bounds.top < 0) {
        element.classList.add("fixed");
      }
    });
  };

  ["scroll", "resize"].forEach(function(event) {
    window.addEventListener(event, check);
  });

  return {
    restrict: "A",
    link: function(scope, element, attributes) {
      element = element[0];
      stuck.push(element);
    }
  }
});

var render = function(canvas, data, position) {
    var context = canvas.getContext("2d");
    var years = ["year-2010", "year-2011", "year-2012", "year-2013", "year-2014"];
    var values = [];
    var items = years.map(function(year) {
      var value = data[year];
      if (value) values.push(value);
      return {
        value: value,
        year: year.replace("year-", "")
      }
    });
    var penDown = false;
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = "#D8761B";
    context.lineWidth = 1.5;
    var padding = 3;
    var top = canvas.height - padding;
    var left = padding;
    var height = canvas.height - padding * 2;
    var width = canvas.width - padding * 2;
    items.forEach(function(item, i) {
      if (!item.value) return;
      var x = width / (years.length - 1) * i + padding;
      var y = top - ((item.value - min) / (max - min) * height);
      context[penDown ? "lineTo" : "moveTo"](x, y);
      penDown = true;
    });
    context.moveTo(0, 0);
    if (penDown) context.stroke();
    context.closePath();
    if (position) {
      context.fillStyle = "rgba(0, 0, 0, .5)";
      context.beginPath();
      var segment = width / (years.length - 1);
      var index = Math.round(position.x / segment);
      var item = items[index];
      var y = top - ((item.value - min) / (max - min) * height);
      context.arc(index * segment + padding, y, 3, 0, Math.PI * 2);
      context.fill();
      return item;
    }
  };

app.directive("sparkLine", function() {
  return {
    template: `<canvas width=120 height=30></canvas>`,
    restrict: "E",
    scope: {
      data: "="
    },
    link: function(scope, element, attrs) {

      var data = scope.data;
      var canvas = element.find("canvas")[0];
      render(canvas, data);
      
      var tooltip = document.querySelector(".spark-tooltip");

      var onmove = function(e) {
        if (e.target.tagName.toLowerCase() != "canvas") return;
        var position;
        if (e.offsetX) {
          position = {
            x: e.offsetX,
            y: e.offsetY
          };
        } else {
          var bounds = canvas.getBoundingClientRect();
          position = {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top
          };
        }
        var item = render(canvas, data, position);
        tooltip.classList.add("show");
        tooltip.style.top = e.pageY + 20 + "px";
        tooltip.style.left = e.pageX + 10 + "px";
        if (item.value == "") {
          item.value = "N/A"
        } else {
          item.value = "$" + item.value;
        }
        tooltip.innerHTML = item.year + ": " + item.value;
      };

      element.on("mousemove", onmove);
      element.on("click", onmove);
      element.on("mouseout", function(e) {
        render(canvas, data);
        tooltip.classList.remove("show");
      });
    }
  }
});

app.controller("CompanyController", ["$scope", function($scope) {
  $scope.stockData = stockData; 
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