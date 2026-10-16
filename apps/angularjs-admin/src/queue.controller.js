(function () {
  "use strict";

  angular.module("legacyAdmin").controller("QueueController", function (requestService) {
    var vm = this;
    vm.requests = [];
    vm.selected = {};
    vm.search = "";
    vm.status = "";
    vm.error = "";

    vm.load = function () {
      vm.error = "";
      return requestService.list().then(function (items) {
        vm.requests = items;
      }).catch(function () {
        vm.error = "The queue could not be loaded. Check that the Node API is running.";
      });
    };

    vm.select = function (item) { vm.selected = angular.copy(item); };
    vm.save = function () {
      vm.saving = true;
      return requestService.update(vm.selected).then(function (updated) {
        vm.requests = vm.requests.map(function (item) { return item.id === updated.id ? updated : item; });
        vm.selected = angular.copy(updated);
      }).catch(function () {
        vm.error = "The request could not be updated.";
      }).finally(function () { vm.saving = false; });
    };

    vm.load();
  });
})();
