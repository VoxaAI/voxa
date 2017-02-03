'use strict';

const router = exports.router = require('express').Router();
const skill = require('../../skill');
const config = require('../../config');

exports.mountPath = '/skill';

if (config.server.hostSkill) {
  router.post('/', (req, res, next) => {
    console.log(req.body);
    skill.handler(req.body, {
      fail: next,
      succeed: function succeed(msg) {
        res.json(msg);
      },
    }, function callback(error, msg) {
      if(error) return next(error);
      return res.json(msg);
    });
  });
}
