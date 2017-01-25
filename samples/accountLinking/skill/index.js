'use strict';

const skill = require('./skill');

exports.handler = function handler(event, context) {
  skill.execute(event, context)
    .then(context.succeed)
    .catch(context.fail);
};
