'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function mount(dirname) {
  const router = require('express').Router();

  const files = fs.readdirSync(dirname);
  files.forEach((route) => {
    if (route.indexOf('index.js', route.length - 8) >= 0) return;
    const controller = require(path.join(dirname, route));
    if (!controller.router) return;

    router.use(controller.mountPath || '', controller.router);
  });
  return router;
};
