'use strict';

const simple = require('simple-mock');
const expect = require('chai').expect;
const azure = require('botbuilder-azure');

const CortanaAdapter = require('../../lib/adapters/cortana/CortanaAdapter');
const LuisRecognizer = require('../../lib/adapters/cortana/LuisRecognizer');
const VoxaApp = require('../../lib/StateMachineApp');
const views = require('../views');
const variables = require('../variables');
const rawEvent = require('../requests/cortana/microsoft.launch.json');

describe('CortanaAdapter', () => {
  let adapter;
  let recognizer;
  let app;
  let storage;
  let azureTableClient;

  afterEach(() => {
    simple.restore();
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    recognizer = new LuisRecognizer('http://example.com');
    azureTableClient = new azure.AzureTableClient();
    storage = new azure.AzureBotStorage({ gzipData: false }, azureTableClient);

    // we need to mock this before instantiating the adapters cause otherwise
    // we try to get the authorization token
    simple.mock(CortanaAdapter.prototype, 'getAuthorization').resolveWith({
      access_token: 'ACCESS TOKEN',
    });

    adapter = new CortanaAdapter(app, { recognizer, storage });
    simple.mock(storage, 'getData')
      .callbackWith(null, {});

    simple.mock(storage, 'saveData')
      .callbackWith(null, {});

    simple.mock(adapter, 'botApiRequest')
      .resolveWith(true);
  });

  it('should throw an error if config doesn\'t include a recognizer', () => {
    expect(() => { const a = new CortanaAdapter(app, {}); }).to.throw('Cortana requires a recognizer');
  });

  it('should throw an error if config doesn\'t include an storage', () => {
    expect(() => { const a = new CortanaAdapter(app, { recognizer }); }).to.throw('Cortana requires a state storage');
  });

  it('should request the authorization token on initialization', () => adapter.qAuthorization.then((authorization) => {
    expect(authorization).to.deep.equal({ access_token: 'ACCESS TOKEN' });
  }));

  describe('partialReply', () => {
    it('should send multiple partial replies', () => {
      app.onIntent('LaunchIntent', (request) => {
        request.model.count = (request.model.count || 0) + 1;
        if (request.model.count > 2) {
          return { reply: 'Count.Tell' };
        }

        return { reply: 'Count.Say', to: 'entry' };
      });

      return adapter.execute(rawEvent)
        .then(() => {
          expect(adapter.botApiRequest.calls.length).to.equal(3);
          expect(adapter.botApiRequest.lastCall.args[2].voxaReply.msg.statements).to.deep.equal([]);
        });
    });
  });
});
