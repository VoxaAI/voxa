'use strict';

const expect = require('chai').expect;
const createServer = require('../lib/create-server');
const views = require('./views');
const http = require('http');
const StateMachineSkill = require('../lib/StateMachineSkill');
const portfinder = require('portfinder');

const debug = require('debug')('test');

describe('createServer', () => {
  let server;
  let port;
  before(() => {
    const skill = new StateMachineSkill({ views });
    server = createServer(skill);
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
      msg: 'Hello World!',
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
        expect('{"version":"1.0","response":{"outputSpeech":{"type":"SSML","ssml":"<speak>An unrecoverable error occurred.</speak>"},"shouldEndSession":true},"sessionAttributes":{}}').to.equal(data);
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
