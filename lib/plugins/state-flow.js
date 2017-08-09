'use strict';

function register(skill) {
  skill.onRequestStarted((voxaEvent) => {
    const fromState = voxaEvent.session.new ? 'entry' : voxaEvent.session.attributes.state || 'entry';
    voxaEvent.flow = [fromState];
  });

  skill.onAfterStateChanged((voxaEvent, reply, transition) => {
    voxaEvent.flow.push(transition.to);
  });
}

module.exports = register;
