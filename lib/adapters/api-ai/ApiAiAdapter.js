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

  static slack(voxaReply) {
    const displayText = voxaReply.msg.plainStatements.join('\n');
    return {
      text: displayText,
    };
  }

  static google(voxaReply) {
    const speech = ssml.toSSML(voxaReply.msg.statements.join('\n'));
    const displayText = voxaReply.msg.plainStatements.join('\n');

    const items = [];
    items.push({
      simpleResponse: {
        ssml: speech,
        displayText,
      },
    });

    if (voxaReply.msg.card) {
      const basicCard = _.pick(voxaReply.msg.card, ['title', 'subtitle', 'formattedText', 'image']);
      if (voxaReply.msg.card.button) {
        const button = {
          title: voxaReply.msg.card.button.title,
          openUrlAction: {
            url: voxaReply.msg.card.button.url,
          },
        };

        basicCard.buttons = [button];
      }

      items.push({ basicCard });
    }

    const isAsk = !!voxaReply.msg.hasAnAsk;
    return {
      expectUserResponse: isAsk,
      isSsml: true,
      noInputPrompts: [],
      richResponse: {
        items,
      },
    };
  }

  static toApiAiResponse(voxaReply) {
    const speech = ssml.toSSML(voxaReply.msg.statements.join('\n'));
    const contextOut = ApiAiAdapter.sessionToContext(voxaReply.session);
    const displayText = voxaReply.msg.plainStatements.join('\n');

    const source = voxaReply.voxaEvent.originalRequest.source;

    const integrations = {
      google: ApiAiAdapter.google,
      slack: ApiAiAdapter.slack,
      slack_testbot: ApiAiAdapter.slack,
    };

    const response = {
      speech,
      displayText,
      contextOut,
      data: {},
      source: 'Voxa',
    };

    response.data[source] = integrations[source](voxaReply);
    return response;
  }
}

module.exports = ApiAiAdapter;

