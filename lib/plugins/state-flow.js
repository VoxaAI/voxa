'use strict';

function register(skill) {
  skill.onRequestStarted((alexaEvent) => {
    const fromState = alexaEvent.session.new ? 'entry' : alexaEvent.session.attributes.state || 'entry';
    alexaEvent.flow = [fromState];
  });

  skill.onAfterStateChanged((alexaEvent, reply, transition) => {
    alexaEvent.flow.push(transition.to);
  });
}

module.exports = register;
