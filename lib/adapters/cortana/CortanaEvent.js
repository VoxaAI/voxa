'use strict';

const VoxaEvent = require('../../VoxaEvent');
const _ = require('lodash');

class CortanaEvent extends VoxaEvent {
  constructor(event, context) {
    super(event, context);
    this.type = 'cortana';
    this.intent = event.intent;
    this.session = {
      new: _.isEmpty(_.get(event, 'stateData.privateConversationData')),
      attributes: _.get(event, 'stateData.privateConversationData') || {},
      sessionId: event.conversation.id,
    };
  }

  get authorization() {
    return this._raw.authorization;
  }

  get user() {
    return _.merge(this._raw.from, { userId: this._raw.from.id });
  }

  get request() {
    let type = this._raw.type;
    if (this._raw.type === 'message') {
      type = 'IntentRequest';
    }

    let locale;
    if (this._raw.locale) {
      locale = this._raw.locale;
    } else {
      locale = _(this._raw.entities)
        .filter({ type: 'clientInfo' })
        .filter(entity => entity.locale)
        .first()
        .locale;
    }

    return {
      type,
      locale,
    };
  }
}


module.exports = CortanaEvent;
