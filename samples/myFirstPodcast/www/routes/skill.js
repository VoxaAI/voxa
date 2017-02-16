'use strict';

const router = require('express').Router();
const skill = require('../../skill');
const config = require('../../config');

exports.mountPath = '/skill';

if (config.server.hostSkill) {
  router.post('/', (req, res, next) => {
    skill.handler(req.body, {
      fail: next,
      succeed: function succeed(msg) {
        res.json(msg);
      },
    }, (err, msg) => {
        console.log('RESPONSE TO ALEXA err', JSON.stringify(err, null, 2));
        console.log('RESPONSE TO ALEXA', JSON.stringify(msg, null, 2));
      if (err) return next(err);
      return res.json(msg);
    });
  });
}

exports.router = router;
