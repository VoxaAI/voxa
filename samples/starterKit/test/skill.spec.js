'use strict';

const skill = require('../skill/MainStateMachine');
const expect = require('chai').expect;

require('../skill/states');

describe('Skill', () => {
  it('should reply with Intent.Launch', () => {
    const event = {
      session: {
        application: {
          applicationId: '',
        },
      },
      request: {
        type: 'LaunchRequest',
      },
    };

    return skill.execute(event)
      .then((result) => {
        expect(result.response.outputSpeech.ssml).to.equal('<speak>Welcome!</speak>');
      });
  });
});
