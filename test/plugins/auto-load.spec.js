'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const simple = require('simple-mock');
const StateMachineSkill = require('../../lib/StateMachineSkill');
const autoLoad = require('../../lib/plugins/auto-load');
const autoLoadAdapter = require('../autoLoadAdapter');
const views = require('../views');
const variables = require('../variables');

describe('AutoLoad plugin', () => {
  let event;

  beforeEach(() => {
    event = {
      sesssion: {
        user: {
          userId: 'user-xyz',
        },
        new: true,
      },
      request: {
        type: 'LaunchRequest',
      },
    };

    simple.mock(autoLoadAdapter, 'get')
    .resolveWith({ Id: 1 });
  });

  it('should get data from adapter filtering with userId', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, autoLoadAdapter, { loadByToken: false });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.data.Id).to.equal(1);
      });
  });

  it('should get data from adapter filtering with accessToken', () => {
    _.set(event, 'session.user.accessToken', 'abc');

    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, autoLoadAdapter, { loadByToken: true });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.data.Id).to.equal(1);
      });
  });

  it('should not get data from adapter with loadByToken is false and no accessToken is provided', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, autoLoadAdapter, { loadByToken: true });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.data).to.deep.equal({});
      });
  });

  it('should not get data from adapter when adapter throws error on getting data', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, autoLoadAdapter);

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    simple.mock(autoLoadAdapter, 'get')
    .rejectWith(new Error('Random error'));

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.data).to.deep.equal({});
      });
  });

  it('should not get data from adapter when adapter has an invalid GET function', () => {
    simple.mock(autoLoadAdapter, 'get', undefined)

    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, autoLoadAdapter);

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.data).to.deep.equal({});
      });
  });
});
