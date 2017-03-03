'use strict';

const skill = require('../skill/MainStateMachine');
const expect = require('chai').expect;

describe('Skill', () => {
  it('should reply with Intent.Launch', () => {
    const event = {
      session: {
        application: {
          applicationId: '',
        },
        user: {
          accessToken: '',
        },
      },
      request: {
        type: 'LaunchRequest',
      },
    };

    return skill.execute(event)
      .then((reply) => {
        expect(reply.toJSON().response.outputSpeech.ssml).to.equal('<speak>Hello! It seems you have not gone through the account linking process. I just sent you a card to the Alexa app so you enter your credentials.</speak>');
      });
  });
});
