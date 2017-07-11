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
      say: ['say', 'What time is it?'],
    },
    'de-de': {
      site: 'Ok für weitere Infos besuchen example.com Website',
      number: 'ein',
      question: 'wie spät ist es?',
      say: ['sagen', 'wie spät ist es?'],
    },
  };

  it('should return an error if the views file doesn\'t have the local strings', () => {
    const localeMissing = 'en-gb';
    const skill = new StateMachineSkill({ variables, views, RenderClass: I18NRenderer });
    skill.onIntent('SomeIntent', () => ({ reply: 'Number.One' }));
    event.request.locale = localeMissing;

    return skill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('An unrecoverable error occurred.');
        expect(reply.error.message).to.equal(`View Number.One for ${localeMissing} locale are missing`);
        expect(reply.msg.directives).to.deep.equal([]);
      });
  });

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
            expect(reply.msg.directives).to.deep.equal([]);
          });
      });

      it(`work with array responses ${locale}`, () => {
        skill.onIntent('SomeIntent', () => ({ reply: ['Say.Say', 'Question.Ask'], to: 'entry' }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements).to.deep.equal(translations.say);
            expect(reply.msg.directives).to.deep.equal([]);
          });
      });

      it('should have the locale available in variables', () => {
        skill.onIntent('SomeIntent', () => ({ reply: 'Number.One' }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements[0]).to.equal(translations.number);
            expect(reply.msg.directives).to.deep.equal([]);
          });
      });

      it('should return response with directives', () => {
        const directives = {
          type: 'AudioPlayer.Play',
          playBehavior: 'REPLACE_ALL',
          offsetInMilliseconds: 0,
          url: 'url',
          token: '123',
        };

        skill.onIntent('SomeIntent', () => ({ reply: 'Question.Ask', to: 'entry', directives }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements[0]).to.equal(translations.question);
            expect(reply.msg.directives).to.be.ok;
          });
      });
    });
  });
});

