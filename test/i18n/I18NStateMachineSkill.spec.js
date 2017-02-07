'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const StateMachineSkill = require('../../lib/i18n/I18NStateMachineSkill.js');
const views = require('./views');
const variables = require('./variables');
const Model = require('../model');
const _ = require('lodash');

describe('I18NStateMachineSkill', () => {
  let statesDefinition;
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
        locale: 'en-us',
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    };

    statesDefinition = {
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: () => ({ to: 'endState' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'endState' }),
    };
  });

  it('should correctly set the translation object in skill.t', () => {
    const skill = new StateMachineSkill('appId', { Model, variables, views });
    _.map(statesDefinition, (state, name) => skill.onState(name, state));

    return skill.execute(event)
      .then((result) => {
        expect(skill.t).to.not.be.undefined;
      });
  });

  const locales = {
    'en-us': '<speak>Ok. For more info visit example.com site.</speak>',
    'de-de': '<speak>Ok für weitere Infos besuchen example.com Website</speak>',
  };

  _.map(locales, (expectedResult, locale) => {
    it(`should return the correct translation for ${locale}`, () => {
      const skill = new StateMachineSkill('appId', { Model, variables, views });
      _.map(statesDefinition, (state, name) => skill.onState(name, state));

      event.request.locale = locale;
      return skill.execute(event)
        .then((result) => {
          expect(result.response.outputSpeech.ssml).to.equal(expectedResult);
        });
    });
  });
});

