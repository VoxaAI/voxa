'use strict';

const skill = require('../skill/MainStateMachine');
const simple = require('simple-mock');
const expect = require('chai').expect;
const UserStorage = require('../services/userStorage');

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

    simple.mock(UserStorage.prototype, 'get')
    .resolveWith({ Id: 1 });

    return skill.execute(event)
      .then((reply) => {
        expect(reply.toJSON().response.outputSpeech.ssml).to.equal('<speak>Hello! It seems you have not gone through the account linking process. I just sent you a card to the Alexa app so you enter your credentials.</speak>');
      });
  });
});
