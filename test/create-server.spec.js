'use strict';

const expect = require('chai').expect;
const createServer = require('../src/adapters/create-server').createServer;
const views = require('./views');
const http = require('http');
const StateMachineApp = require('../src/VoxaApp').VoxaApp;
const AlexaAdapter = require('../src/adapters/alexa/AlexaAdapter').AlexaAdapter;
const portfinder = require('portfinder');

const debug = require('debug')('test');

describe('createServer', () => {
  let server;
  let port;
  before(() => {
    const skill = new StateMachineApp({ views });
    const adapter = new AlexaAdapter(skill);
    server = createServer(adapter);
    return portfinder.getPortPromise()
      .then((_port) => {
        port = _port;
        server.listen(port, () => debug(`Listening on ${port}`));
      });
  });

  it('should return 404 on not GET', (done) => {
    http.get(`http://localhost:${port}`, (res) => {
      expect(res.statusCode).to.equal(404);
      done();
    });
  });

  it('should return json response on POST', (done) => {
    const postData = JSON.stringify({
      request: 'Hello World!',
    });

    const options = {
      port,
      hostname: 'localhost',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      expect(res.statusCode).to.equal(200);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        expect(JSON.parse(data)).to.deep.equal({"response":{"outputSpeech":{"ssml":"<speak>An unrecoverable error occurred.</speak>","type":"SSML"},"shouldEndSession":true},"version":"1.0"})
        done();
      });
    });

    req.write(postData);
    req.end();
  });

  after(() => {
    server.close();
  });
});
