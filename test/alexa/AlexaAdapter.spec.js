'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const VoxaReply = require('../../lib/VoxaReply');
const AlexaAdapter = require('../../lib/adapters/alexa/AlexaAdapter');
const AlexaEvent = require('../../lib/adapters/alexa/AlexaEvent');

describe('AlexaAdapter', () => {
  let reply;
  beforeEach(() => {
    reply = new VoxaReply(new AlexaEvent({}));
  });

  describe('toAlexaReply', () => {
    it('should generate a correct alexa response that doesn\'t  end a session for an ask response', () => {
      reply.append({ ask: 'ask' });
      expect(AlexaAdapter.toAlexaReply(reply)).to.deep.equal({
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
      expect(AlexaAdapter.toAlexaReply(reply)).to.deep.equal({
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
