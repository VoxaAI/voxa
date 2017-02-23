'use strict';

function register(skill) {
  skill.onRequestStarted((request) => {
    const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
    request.flow = [fromState];
  });

  skill.onAfterStateChanged((request, reply, transition) => {
    request.flow.push(transition.to);
  });
}

module.exports = register;
