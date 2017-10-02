'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const ApiAiEvent = require('./ApiAiEvent');
const ssml = require('../../ssml');
const _ = require('lodash');

class ApiAiAdapter extends VoxaAdapter {
  execute(rawEvent, context) {
    const event = new ApiAiEvent(rawEvent, context);
    return this.app.execute(event)
      .then(ApiAiAdapter.toApiAiResponse);
  }

  static wrapSpeech(statement) {
    if (!statement) return undefined;
    return { speech: statement, type: 'SSML' };
  }

  static sessionToContext(session) {
    if (!(session && !_.isEmpty(session.attributes))) {
      return [];
    }

    return _(session.attributes)
      .map((parameters, name) => {
        if (!parameters || _.isEmpty(parameters)) {
          return null;
        }

        if (!_.includes(['state', 'model'], name)) {
          return _.fromPairs([name, parameters]);
        }

        const currentContext = { name, lifespan: 10000, parameters: {} };
        if (_.isPlainObject(parameters)) {
          currentContext.parameters = parameters;
        } else {
          currentContext.parameters[name] = parameters;
        }

        return currentContext;
      })
      .filter()
      .value();
  }

  static toApiAiResponse(voxaReply) {
    const say = ssml.toSSML(voxaReply.msg.statements.join('\n'));
    const reprompt = voxaReply.msg.reprompts.join('\n');
    const directives = voxaReply.msg.directives;
    const isAsk = !!voxaReply.msg.hasAnAsk;
    const contextOut = ApiAiAdapter.sessionToContext(voxaReply.session);


    const response = {
      speech: say,
      displayText: voxaReply.msg.statements.join('\n'),
      contextOut,
      data: {},
      source: 'Cloud',
    };

    return response;
  }
}

module.exports = ApiAiAdapter;

