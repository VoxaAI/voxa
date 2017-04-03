'use strict';

const skill = require('./skill/MainStateMachine');
const config = require('./config');

skill.startServer(config.server.port);
