'use strict';

import { VoxaReply, askP, tellP } from '../../src/directives';
const expect = require('chai').expect;
const _ = require('lodash');
const AlexaEvent = require('../../src/adapters/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../../src/adapters/alexa/AlexaReply').AlexaReply;
const tools = require('../tools');
const botBuilder = require('botbuilder');

const rb = new tools.AlexaRequestBuilder();

describe('AlexaReply', () => {
  let reply;
  let event;
  beforeEach(() => {
    event = new AlexaEvent(rb.getIntentRequest('SomeIntent'));
    reply = new AlexaReply(event);
  });

  describe('toJSON', () => {
    it('should generate a correct alexa response and reprompt that doesn\'t  end a session for an ask response', () => {
      reply.response.statements.push('ask');
      reply.response.reprompt = 'reprompt';
      reply.response.terminate = false;
      reply.yield();

      expect(reply.toJSON()).to.deep.equal({
        response: {
          //card: undefined,
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
        //sessionAttributes: {},
        version: '1.0',
      });
    });


    it('should generate a correct alexa response that doesn\'t  end a session for an ask response', () => {
      reply.response.statements.push('ask');
      reply.response.terminate = false;
      expect(reply.toJSON()).to.deep.equal({
        response: {
          outputSpeech: {
            ssml: '<speak>ask</speak>',
            type: 'SSML',
          },
          shouldEndSession: false,
        },
        version: '1.0',
      });
    });
    it('should generate a correct alexa response that ends a session for a tell response', () => {
      reply.response.statements.push('tell');
      expect(reply.toJSON()).to.deep.equal({
        response: {
          outputSpeech: {
            ssml: '<speak>tell</speak>',
            type: 'SSML',
          },
          shouldEndSession: true,
        },
        version: '1.0',
      });
    });

    it('should generate a correct alexa response that doesn\'t end a session for an ask response', async () => {
      const askF = await askP('ask');
      askF(reply, event)
      expect(reply.toJSON()).to.deep.equal({
        response: {
          outputSpeech: {
            ssml: '<speak>ask</speak>',
            type: 'SSML',
          },
          shouldEndSession: false,
        },
        version: '1.0',
      });
    });

    it('should generate a correct alexa response that ends a session for a tell response', async () => {
      const tellF = await tellP('tell');
      tellF(reply, event)
      expect(reply.toJSON()).to.deep.equal({
        response: {
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
      const event = rb.getIntentRequest('SomeIntent');
      event.session.attributes = { model: { name: 'name' } };
      reply = new AlexaReply(new AlexaEvent(event));
      reply.response.statements.push('tell')
      expect(reply.toJSON()).to.deep.equal({
        response: {
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
      reply.response.statements.push('tell');
      reply.response.directives.push({ type: 'Hint', hint: { text: 'hint', type: 'PlainText' } })
      expect(reply.toJSON()).to.deep.equal({
        response: {
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
