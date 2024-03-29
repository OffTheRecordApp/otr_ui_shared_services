// Karma configuration
// Generated on Tue May 24 2022 20:47:32 GMT-0700 (Pacific Daylight Time)

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ["jasmine", "karma-typescript"],

    karmaTypescriptConfig: {
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        sourceMap: true,
      },
    },
    // list of files / patterns to load in the browser
    files: [
      "node_modules/angular/angular.js",
      "app.ts",
      "tests/module-mocks.ts",
      "services/**/*.ts",
      "tests/**/*spec.ts",
    ],

    // list of files / patterns to exclude
    // TODO: include this test when we get Karma working with ECMA6
    exclude: ["services/aws-s3.service.ts"],

    plugins: [
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-jasmine",
      "karma-typescript",
    ],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      "app.ts": ["karma-typescript"],
      "services/**/*.ts": ["karma-typescript", "coverage"],
      "tests/**/*.ts": ["karma-typescript"],
    },

    coverageReporter: {
      check: {
        global: {
          lines: 75,
        },
      },
      /*
         The first number is the threshold between Red and Yellow.
         The second number is the threshold between Yellow and Green.
       */
      watermarks: {
        statements: [50, 70],
        functions: [50, 70],
        branches: [50, 70],
        lines: [50, 70],
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ["progress", "coverage"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ["ChromeHeadless"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,
  });
};
