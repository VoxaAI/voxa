'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const routes = require('./routes');
const config = require('../config');

const app = express();

app.use(morgan('dev'));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.use((req, res, next) => {
    res.locals.staticRoot = `https://s3.amazonaws.com/${config.s3.bucket}/`;
    next();
  });
} else {
  app.use('/static', express.static(`${__dirname}/public`));
  app.use((req, res, next) => {
    res.locals.staticRoot = '/static/';
    next();
  });
}

// req.body is, by default, undefined, and is populated when you
// use body-parsing middleware such as body-parser and multer.
// more http://expressjs.com/en/api.html#req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(routes.router);

module.exports = app;
