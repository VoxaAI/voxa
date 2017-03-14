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
  it('should fail for missing variables', () => expect(renderer.renderMessage({ say: '{missing}' })).to.eventually.be.rejectedWith(Error, 'No such variable missing'));
  it('should throw an exception if path doesn\'t exists', () => expect(renderer.renderPath('Missing.Path')).to.eventually.be.rejectedWith(Error, 'Missing view Missing.Path'));
});
