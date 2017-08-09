'use strict';

const _ = require('lodash');
const Reply = require('../VoxaReply');
const Promise = require('bluebird');

function register(skill, config) {
  if (!config) {
    config = {};
  }

  skill.onBeforeReplySent((voxaEvent, reply, transition) => {
    if (reply.msg.hasAnAsk) {
      const customReply = _.pickBy({ msgPath: transition.reply, state: transition.to.name });
      voxaEvent.session.attributes.reply = customReply;
    }
  });

  skill.onUnhandledState((voxaEvent) => {
    const reprompt = _.get(voxaEvent, 'session.attributes.reply.msgPath');
    if (!reprompt) {
      return null;
    }

    const reply = new Reply(voxaEvent);
    const viewsToRender = [];
    if (config.startView) {
      viewsToRender.push(config.startView);
    }

    viewsToRender.push(reprompt);

    return Promise
      .reduce(viewsToRender, (reduceReply, viewPath) =>
          skill.renderer.render(voxaEvent, reduceReply, { reply: viewPath })
          .then(result => reduceReply.append(result.message)), reply)
      .then(() => ({ reply }));
  });
}

module.exports = register;
