'use strict';

const expect = require('chai').expect;
const DialogFlowPlatform = require('../../src/platforms/dialog-flow/DialogFlowPlatform').DialogFlowPlatform;
const VoxaApp = require('../../src/VoxaApp').VoxaApp;
const views = require('../views').views;
const DialogFlowReply = require('../../src/platforms/dialog-flow/DialogFlowReply').DialogFlowReply;
const DialogFlowEvent = require('../../src/platforms/dialog-flow/DialogFlowEvent').DialogFlowEvent;
const rawEvent = require('../requests/dialog-flow/launchIntent.json');

xdescribe('DialogFlowReply', () => {
  describe('sessionToContext', () => {
    it('should transform a session map object to the DialogFlow context format', () => {
      const event = new DialogFlowEvent(rawEvent)
      const reply = new DialogFlowReply(event);
      reply.session = {
        attributes: {
          model: {
            _state: 'someState',
          },
          otherAttribute: {
            someKey: 'someValue',
          },
          anEmptyAttribute: {},
          simpleAttribute: 'simpleValue',
        },
      };
      const contexts = reply.sessionToContext();

      expect(contexts).to.deep.equal([{
        lifespan: 10000,
        name: 'model',
        parameters: {
          _state: 'someState',
        },
      }, {
        lifespan: 10000,
        name: 'otherAttribute',
        parameters: {
          someKey: 'someValue',
        },
      }, {
        lifespan: 10000,
        name: 'simpleAttribute',
        parameters: {
          simpleAttribute: 'simpleValue',
        },
      }]);
    });

    it('should return an empty context for an empty session', () => {
      const event = new DialogFlowEvent(rawEvent)
      const reply = new DialogFlowReply(event);
      reply.session = { attributes: {}};

      const contexts = reply.sessionToContext();
      expect(contexts).to.deep.equal([]);
    });
  });
  describe('google', () => {
    it('should add the google card', () => {
      const rawEvent = require('../requests/dialog-flow/launchIntent.json');
      const event = new DialogFlowEvent(rawEvent);
      const reply = new DialogFlowReply(event);

      reply.response.statements.push('Hi!');
      reply.response.directives.push({ basicCard: {
        title: 'Title', subtitle: 'Subtitle', formattedText: 'The text', buttons: [ { title: 'ButtonTitle', openUrlAction: { url:  'https://example.com'} }],
      } });

      const response = reply.toJSON()
      expect(response.data.google).to.deep.equal({
        expectUserResponse: false,
        isSsml: true,
        noInputPrompts: [],
        possibleIntents: undefined,
        richResponse: {
          items: [
            {
              simpleResponse: {
                ssml: '<speak>Hi!</speak>',
              },
            },
            {
              basicCard: {
                formattedText: 'The text',
                subtitle: 'Subtitle',
                title: 'Title',
                buttons: [
                  {
                    openUrlAction: {
                      url: 'https://example.com',
                    },
                    title: 'ButtonTitle',
                  },
                ],
              },
            },
          ],
          linkOutSuggestion: undefined,
          suggestions: [],
        },
      });
    });
  });
});
