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
  host: 'api.amazon.com',
  accept: 'application/json',
};

describe('LoginWithAmazon', () => {
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'LaunchIntent',
        },
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
        user: {
          accessToken: 'accessToken',
          userId: 'amzn1.ask.account.xxx',
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
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get user\'s profile information', async () => {
    nock('https://api.amazon.com', { reqheaders })
      .get('/user/profile?access_token=accessToken')
      .reply(200, {
        user_id: 'amzn1.account.K2LI23KL2LK2',
        name: 'John Doe',
        email: 'johndoe@example.com',
        postal_code: 12345,
      });

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('LaunchIntent', async (alexaEvent) => {
      alexaEvent.model.lwaInfo = await alexaEvent.lwa.getUserInformation();
      return { reply: 'LWA.Information' };
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('Hi John Doe, your email is johndoe@example.com, and your zip code is 12345');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });

  it('should send error when trying to fetch distance units information', async () => {
    nock('https://api.amazon.com', { reqheaders })
      .get('/user/profile?access_token=accessToken')
      .replyWithError('Could not find resource for URI');

    const stateMachineSkill = new StateMachineSkill({ variables, views });

    stateMachineSkill.onIntent('LaunchIntent', async (alexaEvent) => {
      try {
        alexaEvent.model.lwaInfo = await alexaEvent.lwa.getUserInformation();
        return { reply: 'LWA.Information' };
      } catch (err) {
        return { reply: 'LWA.Error' };
      }
    });

    const reply = await stateMachineSkill.execute(event);

    expect(reply.msg.statements[0]).to.equal('There was an error trying to get your profile info.');
    expect(reply.msg.reprompt).to.be.empty;
    expect(reply.session.attributes.state).to.equal('die');
    expect(reply.toJSON().response.shouldEndSession).to.equal(true);
  });
});
