'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');

const StateMachineSkill = require('../lib/StateMachineSkill.js');
const views = require('./views');
const variables = require('./variables');

chai.use(chaiAsPromised);
const expect = chai.expect;

const reqheaders = {
  authorization: 'Bearer apiAccessToken',
  host: 'api.amazonalexa.com',
  accept: 'application/json',
};

describe('DeviceSettings', () => {
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'SettingsIntent',
        },
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
      context: {
        System: {
          apiEndpoint: 'https://api.amazonalexa.com',
          apiAccessToken: 'apiAccessToken',
          device: {
            deviceId: 'deviceId',
          },
        },
      },
    };

    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/devices/deviceId/settings/System.temperatureUnits')
      .reply(200, 'CELSIUS')
      .get('/v2/devices/deviceId/settings/System.timeZone')
      .reply(200, 'America/Chicago');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get full settings information', async () => {
    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/devices/deviceId/settings/System.distanceUnits')
      .reply(200, 'METRIC');

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('SettingsIntent', async (alexaEvent) => {
      const info = await alexaEvent.deviceSettings.getSettings();

      alexaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
      return { reply: 'DeviceSettings.FullSettings' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Your default settings are: METRIC, CELSIUS, America/Chicago');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should get full settings information but distanceUnit due to safe-to-ignore error', async () => {
    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/devices/deviceId/settings/System.distanceUnits')
      .replyWithError({ message: 'Could not find resource for URI', code: 204 });

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('SettingsIntent', async (alexaEvent) => {
      const info = await alexaEvent.deviceSettings.getSettings();

      alexaEvent.model.settingsInfo = `${info.temperatureUnits}, ${info.timezone}`;
      return { reply: 'DeviceSettings.FullSettings' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Your default settings are: CELSIUS, America/Chicago');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should send error when trying to fetch distance units information', async () => {
    nock.cleanAll();

    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/devices/deviceId/settings/System.distanceUnits')
      .replyWithError({ message: 'Could not find resource for URI', code: 204 })
      .get('/v2/devices/deviceId/settings/System.temperatureUnits')
      .replyWithError({ message: 'Could not find resource for URI', code: 204 })
      .get('/v2/devices/deviceId/settings/System.timeZone')
      .replyWithError('Could not find resource for URI');

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('SettingsIntent', async (alexaEvent) => {
      try {
        const info = await alexaEvent.deviceSettings.getSettings();

        alexaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
        return { reply: 'DeviceSettings.FullSettings' };
      } catch (err) {
        return { reply: 'DeviceSettings.Error' };
      }
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('There was an error trying to get your settings info.');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });
});
