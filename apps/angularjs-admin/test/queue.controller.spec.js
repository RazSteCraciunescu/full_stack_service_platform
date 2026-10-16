describe("QueueController", function () {
  "use strict";
  var $controller, $rootScope, deferred, service;

  beforeEach(module("legacyAdmin"));
  beforeEach(inject(function (_$controller_, _$rootScope_, $q) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    deferred = $q.defer();
    service = { list: jasmine.createSpy("list").and.returnValue(deferred.promise), update: jasmine.createSpy("update") };
  }));

  it("loads requests into the view model", function () {
    var controller = $controller("QueueController", { requestService: service });
    deferred.resolve([{ id: "SR-1", status: "Open" }]);
    $rootScope.$digest();
    expect(controller.requests.length).toBe(1);
  });
});
