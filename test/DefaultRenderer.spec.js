'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const DefaultRenderer = require('../lib/renderers/DefaultRenderer');
const variables = require('./variables');
const views = require('./views');

describe('DefaultRenderer', () => {
  let renderer;
  beforeEach(() => {
    renderer = new DefaultRenderer({ views, variables });
  });

  it('should throw an exception if config doesn\'t include views', () => {
    // eslint-disable-next-line
    expect(() => { new DefaultRenderer({}); }).to.throw(Error, 'DefaultRenderer config should include views');
  });

  it('should render the correct view based on path', () => expect(renderer.renderPath('Question.Ask')).to.eventually.deep.equal({ ask: 'What time is it?' }));
  it('should use the passed variables and model', () => expect(renderer.renderMessage({ say: '{count}' }, { model: { count: 1 } })).to.eventually.deep.equal({ say: '1' }));
  it('should fail for missing variables', () => expect(renderer.renderMessage({ say: '{missing}' })).to.eventually.be.rejectedWith(Error, 'No such variable in views, ReferenceError: missing is not defined'));
  it('should throw an exception if path doesn\'t exists', () => expect(renderer.renderPath('Missing.Path')).to.eventually.be.rejectedWith(Error, 'Missing view Missing.Path'));
  it('should select a random option from the samples', () => renderer.renderPath('Random')
      .then((rendered) => {
        expect(rendered.tell).to.be.oneOf(['Random 1', 'Random 2', 'Random 3']);
      }));
  it('should use deeply search to render object variable', () => expect(renderer.renderMessage({ card: '{exitCard}' }, { model: { count: 1 } }))
    .to.eventually.deep.equal(
    {
      card: {
        type: 'Standard',
        title: 'title',
        text: 'text',
        image: {
          smallImageUrl: 'smallImage.jpg',
          largeImageUrl: 'largeImage.jpg',
        },
      },
    }));

  it('should use deeply search variable and model in complex object structure', () => expect(renderer.renderMessage({ card: { title: '{count}', text: '{count}', array: [{ a: '{count}' }] } }, { model: { count: 1 } }))
    .to.eventually.deep.equal(
    {
      card: {
        title: '1',
        text: '1',
        array: [{ a: '1' }],
      },
    }));

  it('should use deeply search to render array variable', () => expect(renderer.renderMessage({ card: '{exitArray}' }, { model: {} }))
    .to.eventually.deep.equal({ card: [{ a: 1 }, { b: 2 }, { c: 3 }] }));
});
