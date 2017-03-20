'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const simple = require('simple-mock');
const StateMachineSkill = require('../../lib/StateMachineSkill');
const autoLoad = require('../../lib/plugins/auto-load');
const views = require('../views');
const variables = require('../variables');
const AutoLoadAdapter = require('../autoLoadAdapter');

const adapter = new AutoLoadAdapter();

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

    simple.mock(AutoLoadAdapter.prototype, 'get')
    .resolveWith({ Id: 1 });
  });

  afterEach(() => {
    simple.restore();
  });

  it('should get data from adapter filtering with userId', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, { adapter, loadByToken: false });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.modelData.user.Id).to.equal(1);
      });
  });

  it('should get data from adapter filtering with accessToken', () => {
    _.set(event, 'session.user.accessToken', 'abc');

    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, { adapter, loadByToken: true });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.modelData.user.Id).to.equal(1);
      });
  });

  it('should not get data from adapter with loadByToken is false and no accessToken is provided', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, { adapter, loadByToken: true });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.state).to.equal('die');
        expect(result.session.attributes.modelData).to.deep.equal({});
      });
  });

  it('should not get data from adapter when adapter throws error on getting data', () => {
    const skill = new StateMachineSkill({ variables, views });
    autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    simple.mock(adapter, 'get')
    .rejectWith(new Error('Random error'));

    skill.onError((alexaEvent, error) => {
      expect(spy.called).to.be.false;
      expect(spy.lastCall.args).to.be.empty;
      expect(error).to.be.ok;
      expect(error.message).to.equal('Random error');
      expect(alexaEvent.session).to.be.undefined;
    });

    return skill.execute(event);
  });

  it('should not get data from adapter when adapter has an invalid GET function', () => {
    simple.mock(adapter, 'get', undefined);

    const skill = new StateMachineSkill({ variables, views });
    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));

    try {
      autoLoad(skill, { adapter });
    } catch (error) {
      expect(spy.called).to.be.false;
      expect(spy.lastCall.args).to.be.empty;
      expect(error).to.be.ok;
      expect(error.message).to.equal('No get method to fetch data from');
    }
  });
});
