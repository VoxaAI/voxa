'use strict';

const VoxaEvent = require('../../VoxaEvent');
const _ = require('lodash');

class CortanaEvent extends VoxaEvent {
  constructor(event, context) {
    super(event, context);
    this.type = 'cortana';
    this.intent = event.intent;
    this.session = {
      new: _.isEmpty(event.stateData.data),
      attributes: event.stateData.data || {},
      sessionId: event.conversation.id,
    };
  }

  get authorization() {
    return this._raw.authorization;
  }

  get user() {
    return { userId: this._raw.from.id };
  }

  get request() {
    let type = this._raw.type;
    if (this._raw.type === 'message') {
      type = 'IntentRequest';
    }

    return {
      type,
      locale: this._raw.locale,
    };
  }
}


module.exports = CortanaEvent;
