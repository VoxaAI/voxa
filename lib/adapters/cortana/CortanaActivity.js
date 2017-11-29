'use strict';

const uuidv1 = require('uuid/v1');
const ssml = require('../../ssml');

class CortanaActivity {
  constructor(event, voxaReply) {
    this.voxaReply = voxaReply;
    this.event = event;
  }

  toJSON() {
    const inputHint = this.voxaReply.msg.terminate ? 'ignoringInput' : 'expectingInput';
    const speak = ssml.toSSML(this.voxaReply.msg.statements.join('\n'));
    const text = this.voxaReply.msg.plainStatements.join('\n');
    let channelData;

    if (this.event.channelData) {
      channelData = {
        clientActivityId: this.event.channelData.clientActivityId,
      };
    }

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
        name: this.event._raw.recipient.name,
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
    };
  }
}

module.exports = CortanaActivity;
