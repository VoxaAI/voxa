'use strict';

// Include the state machine module and the replyWith function
const Voxa = require('voxa');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');

const skill = new Voxa({ variables, views });
states.register(skill);
module.exports = skill;
