'use strict';

const http = require('http');
const app = require('./app');
const env = require('../config/env.js');
const config = require('../config');

const server = http.createServer(app);
console.log(`Attempting to start.\r\n\tNode version: ${process.version}\r\n\tNODE_ENV: ${env}`);

server.listen(config.server.port, () => {
  console.log('Server listening on port %d.', config.server.port);
});
