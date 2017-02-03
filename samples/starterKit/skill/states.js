'use strict';

const skill = require('./MainStateMachine')

skill.onState('entry', {
  to: {
    LaunchIntent: 'launch',
    'AMAZON.HelpIntent': 'help',
  },
});

skill.onState('launch',  () => ({ reply: 'Intent.Launch', to: 'entry' }));
skill.onState('help',  () => ({ reply: 'Intent.Help', to: 'die' }));

