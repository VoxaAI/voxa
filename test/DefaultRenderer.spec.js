'use strict';

const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const i18next = Promise.promisifyAll(require('i18next'));

chai.use(chaiAsPromised);
const expect = chai.expect;

const StateMachineApp = require('../lib/StateMachineApp');
const DefaultRenderer = require('../lib/renderers/DefaultRenderer');
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');
const AlexaEvent = require('../lib/adapters/alexa/AlexaEvent');
const DialogFlowEvent = require('../lib/adapters/dialog-flow/DialogFlowEvent');

describe('I18NStateMachineApp', () => {
  let statesDefinition;
  let event;
  let renderer;

  beforeEach(() => {
    const i18nextPromise = i18next
      .initAsync({
        resources: views,
        load: 'all',
        nonExplicitWhitelist: true,
      });

    renderer = new DefaultRenderer({ views, variables }, i18nextPromise);
    event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
        locale: 'en-US',
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    });

    statesDefinition = {
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: () => ({ to: 'endState' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'endState' }),
    };
  });

  const locales = {
    'en-US': {
      site: 'Ok. For more info visit example.com site.',
      number: 'one',
      question: 'What time is it?',
      say: ['say', 'What time is it?'],
      random: ['Random 1', 'Random 2', 'Random 3', 'Random 4'],
    },
    'de-DE': {
      site: 'Ok für weitere Infos besuchen example.com Website',
      number: 'ein',
      question: 'wie spät ist es?',
      say: ['sagen', 'wie spät ist es?'],
      random: ['zufällig1', 'zufällig2', 'zufällig3', 'zufällig4', 'zufällig5'],
    },
  };

  it('should return an error if the views file doesn\'t have the local strings', () => {
    const localeMissing = 'en-GB';
    const skill = new StateMachineApp({ variables, views });
    skill.onIntent('SomeIntent', () => ({ reply: 'Number.One' }));
    event.request.locale = localeMissing;

    return skill.execute(event)
      .then((reply) => {
        console.log(reply);
        expect(reply.msg.statements[0]).to.equal('An unrecoverable error occurred.');
        expect(reply.error.message).to.equal(`View Number.One for ${localeMissing} locale is missing`);
        expect(reply.msg.directives).to.deep.equal([]);
      });
  });

  _.forEach(locales, (translations, locale) => {
    describe(locale, () => {
      let skill;

      beforeEach(() => {
        skill = new StateMachineApp({ variables, views });
      });

      it(`shold return a random response from the views array for ${locale}`, () => {
        skill.onIntent('SomeIntent', () => ({ reply: 'RandomResponse' }));
        event.request.locale = locale;
        return skill.execute(event)
          .then((reply) => {
            expect(reply.msg.statements[0]).to.be.oneOf(translations.random);
          });
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
  it('should render the correct view based on path', () => expect(renderer.renderPath('Question.Ask', event)).to.eventually.deep.equal({ ask: 'What time is it?', reprompt: 'What time is it?' }));
  it('should use the passed variables and model', () => expect(renderer.renderMessage({ say: '{count}' }, { model: { count: 1 } })).to.eventually.deep.equal({ say: '1' }));

  it('should fail for missing variables', () => expect(renderer.renderMessage({ say: '{missing}' })).to.eventually.be.rejectedWith(Error, 'No such variable in views, ReferenceError: missing is not defined'));
  it('should throw an exception if locale is missing from the event', () => expect(renderer.renderPath('Question.Ask', { locale: undefined })).to.eventually.be.rejectedWith(Error, 'Locale not specified'));
  it('should throw an exception if path doesn\'t exists', () => expect(renderer.renderPath('Missing.Path', event)).to.eventually.be.rejectedWith(Error, 'View Missing.Path for en-US locale is missing'));
  it('should select a random option from the samples', () => (renderer.renderPath('RandomResponse', event))
    .then((rendered) => {
      expect(rendered.tell).to.be.oneOf(['Random 1', 'Random 2', 'Random 3', 'Random 4']);
    }));
  it('should use deeply search to render object variable', () => expect(renderer.renderMessage({ card: '{exitCard}', number: 1 }, { model: { count: 1 } }))
    .to.eventually.deep.equal({
      card: {
        type: 'Standard',
        title: 'title',
        text: 'text',
        image: {
          smallImageUrl: 'smallImage.jpg',
          largeImageUrl: 'largeImage.jpg',
        },
      },
      number: 1,
    }));

  it('should use deeply search variable and model in complex object structure', () => expect(renderer.renderMessage({ card: { title: '{count}', text: '{count}', array: [{ a: '{count}' }] } }, { model: { count: 1 } }))
    .to.eventually.deep.equal({
      card: {
        title: '1',
        text: '1',
        array: [{ a: '1' }],
      },
    }));

  it('should use deeply search to render array variable', () => expect(renderer.renderMessage({ card: '{exitArray}' }, { model: {} }))
    .to.eventually.deep.equal({ card: [{ a: 1 }, { b: 2 }, { c: 3 }] }));

  it('should use the dialogFlow view if available', () => {
    const dialogFlowEvent = new DialogFlowEvent(require('./requests/dialog-flow/launchIntent.json'));
    return renderer.renderPath('LaunchIntent.OpenResponse', dialogFlowEvent)
      .then((rendered) => {
        expect(rendered.tell).to.equal('Hello from DialogFlow');
      });
  });
});
