'use strict';

var fs = require('fs'),
    path = require('path'),
    S = require('string');

module.exports = function (dirname) {
  var router = require('express').Router();

  var files = fs.readdirSync(dirname);
  files.forEach(function (route) {
    if (S(route).endsWith('index.js')) return;
    var controller = require(path.join(dirname, route));
    if (!controller.router) return;
    router.use(controller.mountPath || '', controller.router);
  });
  return router;
};
