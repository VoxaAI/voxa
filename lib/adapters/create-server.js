'use strict';

const http = require('http');
const debug = require('debug')('voxa');

function createServer(skill) {
  return http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(404);
      return res.end();
    }

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      skill.execute(data)
        .then((reply) => {
          res.end(JSON.stringify(reply));
        })
        .catch((error) => {
          debug('error', error);
          res.end(JSON.stringify(error));
        });
    });

    return res.writeHead(200, { 'Content-Type': 'application/json' });
  });
}

module.exports = createServer;
