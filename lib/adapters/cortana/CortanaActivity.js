'use strict';

const uuidv1 = require('uuid/v1');
const ssml = require('../../ssml');
const _ = require('lodash');

class CortanaActivity {
  constructor(event, voxaReply) {
    this.voxaReply = voxaReply;
    this.event = event;
  }

  toJSON() {
    const speak = ssml.toSSML(this.voxaReply.msg.statements.join('\n'));
    const text = this.voxaReply.msg.plainStatements.join('\n');
    const inputHint = this.voxaReply.msg.terminate ? 'acceptingInput' : 'expectingInput';
    let channelData;

    if (this.event.channelData) {
      channelData = {
        clientActivityId: this.event.channelData.clientActivityId,
      };
    }

    const attachments = _(this.voxaReply.msg.directives)
      .filter(directive => _.get(directive, 'data.contentType'))
      .map('data')
      .value();

    const suggestedActions = _(this.voxaReply.msg.directives)
      .filter(directive => _.get(directive, 'data.actions') && !_.get(directive, 'data.contentType'))
      .map('data')
      .find();


    return {
      inputHint,
      text,
      speak,
      channelData,
      type: 'message',
      id: uuidv1(),
      timestamp: new Date().toISOString(),
      serviceUrl: this.event.serviceUrl,
      channelId: this.event.channelId,
      from: {
        id: this.event._raw.recipient.id,
      },
      conversation: {
        id: this.event.session.sessionId,
      },
      recipient: {
        id: this.event.user.id,
        name: this.event.user.name,
      },
      textFormat: 'plain',
      locale: this.event.request.locale,
      attachments,
      suggestedActions,
      replyToId: this.event._raw.id,
    };
  }
}

module.exports = CortanaActivity;
