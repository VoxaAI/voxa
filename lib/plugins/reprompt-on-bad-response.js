'use strict';

const _ = require('lodash');
const Reply = require('../Reply');
const Promise = require('bluebird');

function register(skill, config) {
  if (!config) {
    config = {};
  }
  skill.onUnhandledState((request) => {
    const reprompt = _.get(request, 'session.attributes.reprompt');
    if (!reprompt) {
      return null;
    }

    const reply = new Reply(request);
    const viewsToRender = [];
    if (config.startView) {
      viewsToRender.push(config.startView);
    }

    viewsToRender.push(reprompt);

    return Promise
      .reduce(viewsToRender, (reduceReply, viewPath) =>
          skill.renderer.render(request, reduceReply, { reply: viewPath })
        .then(result => reduceReply.append(result.message)), reply)
      .then(() => ({ reply }));
  });
}

module.exports = register;
