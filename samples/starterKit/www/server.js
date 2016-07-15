'use strict';

var express = require('express'), bodyParser = require('body-parser'), serveStatic = require('serve-static'), morgan = require('morgan'), http = require('http'), path = require('path'), routes = require('./routes'), config = require('../config'), env = require('../config/env.js')
  ;

console.log('Attempting to start.\r\n\t'
            + 'Node version: '
            + process.version
            + '\r\n\tNODE_ENV: '
            + env);

var app = express();

app.use(morgan('dev'));

// req.body is, by default, undefined, and is populated when you
// use body-parsing middleware such as body-parser and multer.
// more http://expressjs.com/en/api.html#req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(routes.router);

var server = http.createServer(app);
server.listen(config.server.port, function() {
  console.log('Server listening on port %d.', config.server.port);
});
