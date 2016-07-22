'use strict';

var router = exports.router = require('express').Router(),
  skill = require('../../skill'),
  config = require('../../config')
;

exports.mountPath = '/skill';

if (config.server.hostSkill) {
  router.post('/', function (req, res, next) {
    console.log(req.body);
    skill.handler(req.body, {
      fail: next,
      succeed: function succeed(msg) {
        res.json(msg);
      },
    });
  });
}
