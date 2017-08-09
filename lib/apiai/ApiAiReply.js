'use strict';

const _ = require('lodash');
const VoxaReply = require('../VoxaReply');

class ApiAiReply extends VoxaReply {
  toJSON() {
    const speech = VoxaReply.toSSML(this.msg.statements.join('\n'));
    const disaplayText = this.msg.statements.join('\n');

    const isAsk = !!this.msg.hasAnAsk;

    const apiAiResponse = {
      speech,
      disaplayText,
      data: { },
    };

    if (this.session && _.isEmpty(this.session.attributes)) {
      apiAiResponse.data.sessionAttributes = this.session.attributes;
    }

    return apiAiResponse;
  }

}

module.exports = ApiAiReply;

