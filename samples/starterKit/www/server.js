'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const http = require('http');
const routes = require('./routes');
const config = require('../config');
const env = require('../config/env.js');

console.log(`${'Attempting to start.\r\n\t' +
            'Node version: '}${
            process.version
            }\r\n\tNODE_ENV: ${
            env}`);

const app = express();

app.use(morgan('dev'));

// req.body is, by default, undefined, and is populated when you
// use body-parsing middleware such as body-parser and multer.
// more http://expressjs.com/en/api.html#req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(routes.router);

const server = http.createServer(app);
server.listen(config.server.port, () => {
  console.log('Server listening on port %d.', config.server.port);
});
