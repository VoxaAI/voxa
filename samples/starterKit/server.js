'use strict';

const skill = require('./skill/MainStateMachine'),
			config = require('./config');

skill.startServer(config.server.port);
