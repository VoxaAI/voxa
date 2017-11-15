'use strict';

const uuidv1 = require('uuid/v1');


class CortanaActivity {
  constructor(event, voxaReply) {
    this.voxaReply = voxaReply;
    this.event = event;
  }

  toJSON() {
    return {
      type: 'message',
      id: uuidv1(),
      timestamp: new Date().toISOString(),
      serviceUrl: this.event.serviceUrl,
      channelId: this.event.channelId,
      from: {
        id: this.event.recipient.id,
        name: this.event.recipient.name,
      },
      conversation: {
        id: this.event.conversation.id,
      },
      recipient: {
        id: this.event.from.id,
        name: this.event.from.name,
      },
      textFormat: 'plain',
      locale: this.event.local,
      text: this.voxaReply.msg.plainStatements.join('\n'),
      channelData: {
        clientActivityId: this.event.channelData.clientActivityId,
      },
      value: this.voxaReply.session.attributes.model,
    };
  }
}

module.exports = CortanaActivity;
