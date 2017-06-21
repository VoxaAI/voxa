'use strict';

// Include the state machine module and the replyWith function
const Voxa = require('voxa');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');
const UserStorage = require('../services/userStorage');

const adapter = new UserStorage();

const skill = new Voxa({ variables, views });
states.register(skill);
Voxa.plugins.autoLoad(skill, { adapter });

module.exports = skill;
