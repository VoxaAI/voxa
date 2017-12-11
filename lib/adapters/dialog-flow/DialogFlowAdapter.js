'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const DialogFlowEvent = require('./DialogFlowEvent');
const ssml = require('../../ssml');
const _ = require('lodash');

class DialogFlowAdapter extends VoxaAdapter {
  execute(rawEvent, context) {
    const event = new DialogFlowEvent(rawEvent, context);
    return this.app.execute(event)
      .then(DialogFlowAdapter.toDialogFlowResponse);
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
    const noInputPrompts = [];
    let systemIntent;
    let suggestions;
    let possibleIntents;

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

    if (voxaReply.msg.reprompt) {
      noInputPrompts.push({
        ssml: voxaReply.msg.reprompt,
      });
    }

    _.map(voxaReply.msg.directives, (directive) => {
      if (directive.systemIntent) {
        systemIntent = directive.systemIntent;
      } else if (directive.suggestions) {
        suggestions = directive.suggestions;
      } else if (directive.possibleIntents) {
        possibleIntents = directive.possibleIntents;
      } else {
        items.push(directive);
      }
    });


    return {
      expectUserResponse: !voxaReply.msg.terminate,
      isSsml: true,
      noInputPrompts,
      systemIntent,
      richResponse: {
        items,
        suggestions,
      },
    };
  }

  static toDialogFlowResponse(voxaReply) {
    const speech = ssml.toSSML(voxaReply.msg.statements.join('\n'));
    const contextOut = DialogFlowAdapter.sessionToContext(voxaReply.session);
    const displayText = voxaReply.msg.plainStatements.join('\n');

    const source = _.get(voxaReply, 'voxaEvent.originalRequest.source');

    const integrations = {
      google: DialogFlowAdapter.google,
      slack: DialogFlowAdapter.slack,
      slack_testbot: DialogFlowAdapter.slack,
    };

    const response = {
      speech,
      displayText,
      contextOut,
      data: {},
      source: 'Voxa',
    };

    if (integrations[source]) {
      response.data[source] = integrations[source](voxaReply);
    }

    return response;
  }
}

module.exports = DialogFlowAdapter;
