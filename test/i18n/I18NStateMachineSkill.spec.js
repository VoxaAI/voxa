'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const StateMachineSkill = require('../../lib/StateMachineSkill');
const I18NRenderer = require('../../lib/renderers/I18NRenderer');
const views = require('./views');
const variables = require('./../variables');
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

  const locales = {
    'en-us': {
      site: 'Ok. For more info visit example.com site.',
      number: 'one',
      question: 'What time is it?',
    },
    'de-de': {
      site: 'Ok für weitere Infos besuchen example.com Website',
      number: 'ein',
      question: 'wie spät ist es?',
    },
  };

  _.forEach(locales, (translations, locale) => {
    describe(locale, () => {
      let skill;

      beforeEach(() => {
        skill = new StateMachineSkill({ variables, views, RenderClass: I18NRenderer });
      });

      it(`should return the correct translation for ${locale}`, () => {
        _.map(statesDefinition, (state, name) => skill.onState(name, state));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements[0]).to.equal(translations.site);
          });
      });

      it('should have the locale available in variables', () => {
        skill.onIntent('SomeIntent', () => ({ reply: 'Number.One' }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements[0]).to.equal(translations.number);
          });
      });

      it('should add msgReply for ask statements', () => {
        skill.onIntent('SomeIntent', () => ({ reply: 'Question.Ask' }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.session.attributes.reply).to.deep.equal({
              msgPath: 'Question.Ask',
              state: 'die',
            });
            expect(reply.msg.statements[0]).to.equal(translations.question);
          });
      });
    });
  });
});

