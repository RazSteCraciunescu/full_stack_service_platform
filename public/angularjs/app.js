(function () {
  "use strict";
  if (!window.angular) {
    document.documentElement.removeAttribute("ng-app");
    const board = document.querySelector(".board");
    if (board) {
      board.innerHTML = '<div class="fallback-card"><h2>AngularJS runtime was not loaded</h2><p>This legacy client uses the public cdnjs copy of AngularJS 1.8.3. The main portal and API remain fully local.</p></div>';
    }
    return;
  }

  angular.module("legacyQueueApp", [])
    .factory("requestApi", ["$http", function ($http) {
      return {
        list: function () { return $http.get("/api/requests"); },
        update: function (id, changes) { return $http.patch("/api/requests/" + id, changes); }
      };
    }])
    .controller("QueueController", ["requestApi", function (requestApi) {
      var vm = this;
      vm.items = [];
      vm.query = "";
      vm.status = "";
      vm.loading = false;
      vm.error = "";

      vm.load = function () {
        vm.loading = true;
        vm.error = "";
        return requestApi.list().then(function (response) {
          vm.items = response.data.items;
        }).catch(function () {
          vm.error = "The request queue could not be loaded.";
        }).finally(function () {
          vm.loading = false;
        });
      };

      vm.update = function (item) {
        requestApi.update(item.id, { status: item.status }).catch(function () {
          vm.error = item.id + " could not be updated. Reloading the queue.";
          vm.load();
        });
      };

      vm.searchFilter = function (item) {
        var query = vm.query.toLowerCase();
        var matchesQuery = !query || [item.id, item.title, item.category, item.assignee || ""].join(" ").toLowerCase().indexOf(query) !== -1;
        return matchesQuery && (!vm.status || item.status === vm.status);
      };

      vm.load();
    }]);
}());
