'use strict';

const expect = require('chai').expect;
const DialogFlowAdapter = require('../../lib/adapters/dialog-flow/DialogFlowAdapter');
const VoxaApp = require('../../lib/StateMachineApp');
const views = require('../views');
const VoxaReply = require('../../lib/VoxaReply');
const DialogFlowEvent = require('../../lib/adapters/dialog-flow/DialogFlowEvent');

describe('DialogFlowAdapter', () => {
  describe('execute', () => {
    it('should convert the voxaReply to a Dialog Flow response', () => {
      const rawEvent = require('../requests/dialog-flow/launchIntent.json');
      const voxaApp = new VoxaApp({ views });

      voxaApp.onIntent('LaunchIntent', () => ({ reply: 'LaunchIntent.OpenResponse' }));

      const adapter = new DialogFlowAdapter(voxaApp);

      return adapter.execute(rawEvent)
        .then((reply) => {
          expect(reply.data.google.richResponse.items[0].simpleResponse.ssml).to.equal('<speak>Hello from DialogFlow</speak>');
        });
    });
  });

  describe('slack', () => {
    it('should add the required slack structures', () => {
      const rawEvent = require('../requests/dialog-flow/launchIntent.json');
      const voxaEvent = new DialogFlowEvent(rawEvent);
      const voxaReply = new VoxaReply(voxaEvent, { ask: 'Hi!' });
      expect(DialogFlowAdapter.slack(voxaReply)).to.deep.equal({ text: 'Hi!' });
    });
  });

  describe('google', () => {
    it('should add the google card', () => {
      const rawEvent = require('../requests/dialog-flow/launchIntent.json');
      const voxaEvent = new DialogFlowEvent(rawEvent);
      const voxaReply = new VoxaReply(voxaEvent, {
        ask: 'Hi!',
        card: { title: 'Title', subtitle: 'Subtitle', formattedText: 'The text', button: { title: 'ButtonTitle', url: 'https://example.com' } }
      });
      expect(DialogFlowAdapter.google(voxaReply)).to.deep.equal({
        expectUserResponse: true,
        isSsml: true,
        noInputPrompts: [],
        richResponse: {
          items: [
            {
              simpleResponse: {
                displayText: 'Hi!',
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
                      url: 'https://example.com'
                    },
                    title: 'ButtonTitle'
                  }
                ]
              },
            },
          ],
        },
      });
    });
  });

  describe('sessionToContext', () => {
    it('should transform a session map object to the DialogFlow context format', () => {
      const contexts = DialogFlowAdapter.sessionToContext({
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
      });

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
      const contexts = DialogFlowAdapter.sessionToContext({});
      expect(contexts).to.deep.equal([]);
    });
  });
});

