module.exports = function (config) {
  config.set({
    frameworks: ["jasmine"],
    files: [
      "node_modules/angular/angular.js",
      "node_modules/angular-mocks/angular-mocks.js",
      "src/app.module.js",
      "src/*.js",
      "test/*.spec.js"
    ],
    browsers: ["ChromeHeadless"],
    singleRun: true
  });
};
