'use strict';

const _ = require('lodash');
const Reply = require('../Reply');
const Promise = require('bluebird');

function register(skill, config) {
  if (!config) {
    config = {};
  }

  skill.onUnhandledState((alexaEvent) => {
    const reprompt = _.get(alexaEvent, 'session.attributes.reply.msgPath');
    if (!reprompt) {
      return null;
    }

    const reply = new Reply(alexaEvent);
    const viewsToRender = [];
    if (config.startView) {
      viewsToRender.push(config.startView);
    }

    viewsToRender.push(reprompt);

    return Promise
      .reduce(viewsToRender, (reduceReply, viewPath) =>
          skill.renderer.render(alexaEvent, reduceReply, { reply: viewPath })
        .then(result => reduceReply.append(result.message)), reply)
      .then(() => ({ reply }));
  });
}

module.exports = register;
