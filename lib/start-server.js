'use strict';

const http = require('http');

function startServer(skill, port) {
  port = port || 3000;

  const server = http.createServer((req, res) => {
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
          console.log('error', error);
          res.end(JSON.stringify(error));
        });
    });

    return res.writeHead(200, { 'Content-Type': 'application/json' });
  });

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

module.exports = startServer;
