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
    it('should generate a correct alexa response that doesn\'t end a session for an ask response', () => {
      reply.append({ ask: 'ask', reprompt: 'reprompt' });
      expect(AlexaAdapter.toAlexaReply(reply)).to.deep.equal({
        response: {
          card: undefined,
          outputSpeech: {
            ssml: '<speak>ask</speak>',
            type: 'SSML',
          },
          reprompt: {
            outputSpeech: {
              ssml: '<speak>reprompt</speak>',
              type: 'SSML',
            },
          },
          shouldEndSession: false,
        },
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
        version: '1.0',
      });
    });

    it('should generate a correct alexa response persisting session attributes', () => {
      reply = new VoxaReply(new AlexaEvent({ session: { attributes: { model: { name: 'name' } } } }));
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
        sessionAttributes: {
          model: {
            name: 'name',
          },
        },
        version: '1.0',
      });
    });

    it('should generate a correct alexa response with directives', () => {
      reply.append({ tell: 'tell', directives: [{ hint: 'hint' }] });
      expect(AlexaAdapter.toAlexaReply(reply)).to.deep.equal({
        response: {
          card: undefined,
          directives: [
            {
              hint: {
                text: 'hint',
                type: 'PlainText',
              },
              type: 'Hint',
            },
          ],
          outputSpeech: {
            ssml: '<speak>tell</speak>',
            type: 'SSML',
          },
          shouldEndSession: true,
        },
        version: '1.0',
      });
    });
  });
});
