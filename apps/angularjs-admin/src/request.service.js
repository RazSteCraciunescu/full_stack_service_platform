(function () {
  "use strict";

  angular.module("legacyAdmin").factory("requestService", function ($http) {
    var apiBase = "http://127.0.0.1:4174/api";
    return {
      list: function () { return $http.get(apiBase + "/requests").then(function (response) { return response.data.items; }); },
      update: function (item) {
        return $http.patch(apiBase + "/requests/" + encodeURIComponent(item.id), {
          status: item.status,
          assignee: item.assignee || null
        }).then(function (response) { return response.data; });
      }
    };
  });
})();
