'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const BotFrameworkEvent = require('../../src/platforms/botframework/BotFrameworkEvent').BotFrameworkEvent;

describe('BotFrameworkEvent', () => {
  // it('should map a Microsoft.Launch intent to a voxa LaunchIntent', () => {
    // const rawEvent = _.cloneDeep(require('../requests/botframework/microsoft.launch.json'));
    // const event = new BotFrameworkEvent(rawEvent, {}, {});
    // expect(event.request.type).to.equal('IntentRequest');
    // expect(event.intent.name).to.equal('LaunchIntent');
  // });

  it('should map an endOfConversation request to a voxa SessionEndedRequest', () => {
    const rawEvent = require('../requests/botframework/endOfRequest.json');
    const event = new BotFrameworkEvent(rawEvent, {}, {}, null);
    expect(event.request.type).to.equal('SessionEndedRequest');
  });
});
