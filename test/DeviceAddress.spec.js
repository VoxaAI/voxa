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

describe('DeviceAddress', () => {
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'AddressIntent',
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

    const addressMock = {
      addressLine1: '410 Terry Ave North',
      addressLine2: '',
      addressLine3: 'aeiou',
      city: 'Seattle',
      countryCode: 'US',
      districtOrCounty: '',
      postalCode: '98109',
      stateOrRegion: 'WA',
    };

    const postalCodeMock = {
      countryCode: 'US',
      postalCode: '98109',
    };

    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v1/devices/deviceId/settings/address')
      .reply(200, JSON.stringify(addressMock))
      .get('/v1/devices/deviceId/settings/address/countryAndPostalCode')
      .reply(200, JSON.stringify(postalCodeMock))
      .get('/v1/devices/deviceId/settings/address/countryAndPostalCode')
      .replyWithError('Access to this resource cannot be requested');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get full address', async () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('AddressIntent', async (alexaEvent) => {
      const info = await alexaEvent.deviceAddress.getAddress();

      alexaEvent.model.deviceInfo = `${info.addressLine1}, ${info.city}, ${info.countryCode}`;
      return { reply: 'DeviceAddress.FullAddress' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Right now your device is in: 410 Terry Ave North, Seattle, US');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should get coutry/region and postal code', async () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('AddressIntent', async (alexaEvent) => {
      const info = await alexaEvent.deviceAddress.getCountryRegionPostalCode();

      alexaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
      return { reply: 'DeviceAddress.PostalCode' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Your postal code is: 98109, US');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should send error when trying to fetch coutry/region and postal code and permission hasn\'t been granted', async () => {
    nock.cleanAll();
    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v1/devices/deviceId/settings/address/countryAndPostalCode')
      .replyWithError('Access to this resource cannot be requested');

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('AddressIntent', async (alexaEvent) => {
      try {
        const info = await alexaEvent.deviceAddress.getCountryRegionPostalCode();

        alexaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
        return { reply: 'DeviceAddress.PostalCode' };
      } catch (err) {
        return { reply: 'DeviceAddress.PermissionNotGranted' };
      }
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('To get the device\'s address, go to your Alexa app and grant permission to the skill.');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });
});
