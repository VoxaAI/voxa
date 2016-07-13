'use strict';

var path = require('path');

var env = require('./env').toLowerCase();
var configFile = require(path.join(__dirname, env + '.json'));
configFile.env = env;

module.exports = configFile;

