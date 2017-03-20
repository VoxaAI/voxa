'use strict';

// Include the state machine module and the replyWith function
const Voxa = require('voxa');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');
const UserStorage = require('../services/userStorage');
const userAdapter = new UserStorage();

const skill = new Voxa({ variables, views });
states.register(skill);
Voxa.plugins.autoLoad(skill, userAdapter);
module.exports = skill;
