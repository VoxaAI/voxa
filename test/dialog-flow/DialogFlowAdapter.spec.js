'use strict';

const expect = require('chai').expect;
const DialogFlowAdapter = require('../../src/platforms/dialog-flow/DialogFlowAdapter').DialogFlowAdapter;
const VoxaApp = require('../../src/VoxaApp').VoxaApp;
const views = require('../views').views;
const VoxaReply = require('../../src/VoxaReply').VoxaReply;
const DialogFlowEvent = require('../../src/platforms/dialog-flow/DialogFlowEvent').DialogFlowEvent;

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


});
