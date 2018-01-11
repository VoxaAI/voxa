'use strict';

const _ = require('lodash');

function register(skill) {
  skill.onRequestStarted((voxaEvent) => {
    const fromState = voxaEvent.session.new ? 'entry' : _.get(voxaEvent, 'session.attributes.model._state', 'entry');
    voxaEvent.flow = [fromState];
  });

  skill.onAfterStateChanged((voxaEvent, reply, transition) => {
    voxaEvent.flow.push(transition.to);
  });
}

module.exports = register;
