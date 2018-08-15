'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');

const StateMachineSkill = require('../lib/StateMachineSkill.js');
const views = require('./views');
const variables = require('./variables');

chai.use(chaiAsPromised);
const expect = chai.expect;

const ispMock = {
  inSkillProducts: [
    {
      productId: '1',
      referenceName: 'sword',
    },
    {
      productId: '2',
      referenceName: 'shield',
    },
  ],
};

describe('InSkillPurchase', () => {
  before(() => {
    const reqheaders = {
      'content-type': 'application/json',
      'accept-language': 'en-US',
      authorization: 'Bearer apiAccessToken',
      host: 'api.amazonalexa.com',
      accept: 'application/json',
    };

    nock('https://api.amazonalexa.com', { reqheaders })
      .persist()
      .get('/v1/users/~current/skills/~current/inSkillProducts')
      .reply(200, JSON.stringify(ispMock));
  });

  after(() => {
    nock.cleanAll();
  });

  it('should send a buy request', () => {
    const event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'BuyIntent',
          slots: {
            productName: { name: 'productName', value: 'sword' },
          },
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
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('BuyIntent', (alexaEvent) => {
      const { productName } = alexaEvent.intent.params;
      const token = 'startState';

      return alexaEvent.isp.buyByReferenceName(productName, token)
        .then(buyDirective => ({ directives: buyDirective }));
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.be.empty;
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.msg.directives[0].type).to.equal('Connections.SendRequest');
        expect(reply.msg.directives[0].name).to.equal('Buy');
        expect(reply.msg.directives[0].payload.InSkillProduct.productId).to.equal('1');
        expect(reply.msg.directives[0].token).to.equal('startState');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should send a cancel request', () => {
    const event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'RefundIntent',
          slots: {
            productName: { name: 'productName', value: 'sword' },
          },
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
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('RefundIntent', (alexaEvent) => {
      const { productName } = alexaEvent.intent.params;
      const token = 'startState';

      return alexaEvent.isp.cancelByReferenceName(productName, token)
        .then(buyDirective => ({ directives: buyDirective }));
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.be.empty;
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.msg.directives[0].type).to.equal('Connections.SendRequest');
        expect(reply.msg.directives[0].name).to.equal('Cancel');
        expect(reply.msg.directives[0].payload.InSkillProduct.productId).to.equal('1');
        expect(reply.msg.directives[0].token).to.equal('startState');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should send an upsell request', () => {
    const event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'BuyIntent',
          slots: {
            productName: { name: 'productName', value: 'shield' },
          },
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
        },
      },
    };

    const upsellMessage = 'Please buy it';
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('BuyIntent', (alexaEvent) => {
      const { productName } = alexaEvent.intent.params;
      const token = 'startState';

      return alexaEvent.isp.upsellByReferenceName(productName, upsellMessage, token)
        .then(buyDirective => ({ directives: buyDirective }));
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.be.empty;
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.msg.directives[0].type).to.equal('Connections.SendRequest');
        expect(reply.msg.directives[0].name).to.equal('Upsell');
        expect(reply.msg.directives[0].payload.InSkillProduct.productId).to.equal('2');
        expect(reply.msg.directives[0].payload.upsellMessage).to.equal(upsellMessage);
        expect(reply.msg.directives[0].token).to.equal('startState');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should not send ISP directives on invalid endpoint', () => {
    const event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'BuyIntent',
          slots: {
            productName: { name: 'productName', value: 'shield' },
          },
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
          apiEndpoint: 'https://api.fe.amazonalexa.com',
          apiAccessToken: 'apiAccessToken',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('BuyIntent', (alexaEvent) => {
      if (!alexaEvent.isp.isAllowed()) {
        return { reply: 'ISP.Invalid', to: 'entry' };
      }

      return { to: 'entry' };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('To do In Skill Purchases, you need to link your Amazon account to the US market.');
        expect(reply.msg.reprompt).to.equal('Can you try again?');
        expect(reply.msg.directives).to.be.empty;
        expect(reply.session.attributes.state).to.equal('entry');
        expect(reply.toJSON().response.shouldEndSession).to.equal(false);
      });
  });

  it('should handle ACCEPTED purchase result', () => {
    const event = {
      request: {
        type: 'Connections.Response',
        requestId: 'string',
        timestamp: 'string',
        name: 'Buy',
        status: {
          code: '200',
          message: 'OK',
        },
        payload: {
          purchaseResult: 'ACCEPTED',
          productId: 'string',
          message: 'optional additional message',
        },
        token: 'firstState',
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onState('firstState', () => ({}));
    stateMachineSkill.onSessionStarted((alexaEvent) => {
      alexaEvent.model.flag = 1;
    });

    stateMachineSkill.onIntent('ConnectionsResponse', (alexaEvent) => {
      if (alexaEvent.isp.getPayload().purchaseResult === 'ACCEPTED') {
        const to = alexaEvent.request.token;

        return { reply: 'ISP.ProductBought', to };
      }

      return { reply: 'ISP.ProductNotBought' };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Thanks for buying this product, do you want to try it out?');
        expect(reply.msg.reprompt).to.equal('Do you want to try it out?');
        expect(reply.session.attributes.modelData.flag).to.equal(1);
        expect(reply.session.attributes.state).to.equal('firstState');
        expect(reply.toJSON().response.shouldEndSession).to.equal(false);
      });
  });

  it('should handle DECLINED purchase result', () => {
    const event = {
      request: {
        type: 'Connections.Response',
        requestId: 'string',
        timestamp: 'string',
        name: 'Buy',
        status: {
          code: '200',
          message: 'OK',
        },
        payload: {
          purchaseResult: 'DECLINED',
          productId: 'string',
          message: 'optional additional message',
        },
        token: 'string',
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onSessionStarted((alexaEvent) => {
      alexaEvent.model.flag = 1;
    });

    stateMachineSkill.onIntent('ConnectionsResponse', (alexaEvent) => {
      if (alexaEvent.isp.getPayload().purchaseResult === 'ACCEPTED') {
        return { reply: 'ISP.ProductBought' };
      }

      return { reply: 'ISP.ProductNotBought' };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Thanks for your interest');
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.session.attributes.modelData.flag).to.equal(1);
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });
});
