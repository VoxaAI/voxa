'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const AlexaReply = require('../../lib/alexa/AlexaReply');
const AlexaEvent = require('../../lib/alexa/AlexaEvent');

describe('AlexaReply', () => {
  let reply;
  beforeEach(() => {
    reply = new AlexaReply(new AlexaEvent({}));
  });

  describe('toJSON', () => {
    it('should generate a correct alexa response that doesn\'t  end a session for an ask response', () => {
      reply.append({ ask: 'ask' });
      expect(reply.toJSON()).to.deep.equal({
        response: {
          card: undefined,
          outputSpeech: {
            ssml: '<speak>ask</speak>',
            type: 'SSML',
          },
          shouldEndSession: false,
        },
        sessionAttributes: {},
        version: '1.0',
      });
    });

    it('should generate a correct alexa response that ends a session for a tell response', () => {
      reply.append({ tell: 'tell' });
      expect(reply.toJSON()).to.deep.equal({
        response: {
          card: undefined,
          outputSpeech: {
            ssml: '<speak>tell</speak>',
            type: 'SSML',
          },
          shouldEndSession: true,
        },
        sessionAttributes: {},
        version: '1.0',
      });
    });
  });
});
