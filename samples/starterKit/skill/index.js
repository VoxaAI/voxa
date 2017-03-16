'use strict';

// Include the state machine module, the state machine,
// the responses and variables to be used in this skill
const skill = require('./MainStateMachine');
require('./states');

exports.handler = skill.lambda();
