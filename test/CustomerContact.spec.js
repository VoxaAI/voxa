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

describe('CustomerContact', () => {
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'InformationIntent',
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
      .get('/v2/accounts/~current/settings/Profile.email')
      .reply(200, 'example@example.com')
      .get('/v2/accounts/~current/settings/Profile.name')
      .reply(200, 'John Doe')
      .get('/v2/accounts/~current/settings/Profile.mobileNumber')
      .reply(200, JSON.stringify({ countryCode: '+1', phoneNumber: '999-999-9999' }));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get full contact information', async () => {
    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/accounts/~current/settings/Profile.givenName')
      .reply(200, 'John');

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('InformationIntent', async (alexaEvent) => {
      const info = await alexaEvent.customerContact.getFullUserInformation();

      alexaEvent.model.info = info;
      return { reply: 'CustomerContact.FullInfo' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Welcome John, your email address is example@example.com, and your phone number is +1 999-999-9999');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should get full contact information but givenName due to safe-to-ignore error', async () => {
    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/accounts/~current/settings/Profile.givenName')
      .replyWithError({ message: 'Access to this resource cannot be requested', code: 403 });

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('InformationIntent', async (alexaEvent) => {
      const info = await alexaEvent.customerContact.getFullUserInformation();

      alexaEvent.model.info = info;
      return { reply: 'CustomerContact.FullInfo' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Welcome , your email address is example@example.com, and your phone number is +1 999-999-9999');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should send error when trying to fetch contact information and permission hasn\'t been granted', async () => {
    nock.cleanAll();

    nock('https://api.amazonalexa.com', { reqheaders })
      .get('/v2/accounts/~current/settings/Profile.givenName')
      .replyWithError('Access to this resource cannot be requested')
      .get('/v2/accounts/~current/settings/Profile.name')
      .replyWithError({ message: 'Access to this resource cannot be requested', code: 500 });

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('InformationIntent', async (alexaEvent) => {
      try {
        const info = await alexaEvent.customerContact.getFullUserInformation();

        alexaEvent.model.info = info;
        return { reply: 'CustomerContact.FullInfo' };
      } catch (err) {
        return { reply: 'CustomerContact.PermissionNotGranted' };
      }
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('To get the user\'s info, go to your Alexa app and grant permission to the skill.');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });
});
