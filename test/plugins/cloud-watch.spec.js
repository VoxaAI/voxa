'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const simple = require('simple-mock');

const expect = chai.expect;
const StateMachineSkill = require('../../lib/StateMachineSkill');
const cloudwatchPlugin = require('../../lib/plugins/cloud-watch');
const views = require('../views');
const variables = require('../variables');

describe('CloudwatchPlugin', () => {
  it('should fired skill.onError on purpose in order to test onError handler', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const config = { Namespace: 'fooBarSkill' };
    cloudwatchPlugin(stateMachineSkill, cloudwatch, config);

    stateMachineSkill.onIntent('SomeIntent', () => ({}));

    return stateMachineSkill.execute({})
      .then((reply) => {
        expect(reply.error).not.to.be.undefined;
      });
  });

  it('should test when throwing an error on onBeforeReplySent function', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    const cloudwatch = { putMetricData: () => { throw new Error('Random error'); } };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');

    const config = {
      MetricName: 'fooBarSkill',
    };
    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch, config);

    stateMachineSkill.onIntent('SomeIntent', () => ({}));

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).not.to.be.undefined;
        expect(reply.error.message).to.equal('Random error');
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(3);
      });
  });

  it('should work when passing config.MetricName as a parameter', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');
    const config = {
      MetricName: 'fooBarSkill',
    };
    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch, config);

    stateMachineSkill.onIntent('SomeIntent', () => ({}));

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(1);
      });
  });

  it('should work when config is not passed as a parameter', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');
    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch);

    stateMachineSkill.onIntent('SomeIntent', () => ({}));

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(1);
      });
  });

  it('should use plugin to log every time that onBeforeReplySent function is executed', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');
    const eventMetric = { Namespace: 'fooBarSkill' };

    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch, eventMetric);

    stateMachineSkill.onIntent('SomeIntent', () => ({}));

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(1);
        expect(cloudwatchMock.lastCall.args[0].Namespace).to.equal('fooBarSkill');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].MetricName).to.equal('Caught Error');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Unit).to.equal('Count');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Value).to.equal(0);
      });
  });

  it('should use plugin to log error onError Flow', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    const spySkill = simple.stub().throwWith(new Error('foo random error'));
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');
    const eventMetric = { Namespace: 'fooBarSkill' };

    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch, eventMetric);

    stateMachineSkill.onIntent('SomeIntent', spySkill);
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(spySkill.called).to.be.true;
        expect(spySkill.lastCall.args[0].intent.name).to.equal('SomeIntent');
        expect(reply.msg.statements[0]).to.equal('An unrecoverable error occurred.');
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(1);
        expect(cloudwatchMock.lastCall.args[0].Namespace).to.equal('fooBarSkill');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].MetricName).to.equal('Caught Error');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Unit).to.equal('Count');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Value).to.equal(1);
      });
  });

  it('should use plugin to log error onStateMachineError Flow', () => {
    const stateMachineSkill = new StateMachineSkill({ env: 'production', variables, views });
    const cloudwatch = { putMetricData: (data, callback) => callback(null, 'foobar') };
    const cloudwatchMock = simple.mock(cloudwatch, 'putMetricData');
    const eventMetric = { Namespace: 'fooBarSkill' };

    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'fooIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'Other APP ID',
        },
      },
    };

    cloudwatchPlugin(stateMachineSkill, cloudwatch, eventMetric);

    stateMachineSkill.onIntent('barIntent', () => 'fooStatement');
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('An unrecoverable error occurred.');
        expect(cloudwatchMock.called).to.be.true;
        expect(cloudwatchMock.callCount).to.be.at.most(1);
        expect(cloudwatchMock.lastCall.args[0].Namespace).to.equal('fooBarSkill');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].MetricName).to.equal('Caught Error');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Unit).to.equal('Count');
        expect(cloudwatchMock.lastCall.args[0].MetricData[0].Value).to.equal(1);
      });
  });
});
