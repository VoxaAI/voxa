'use strict';

const VoxaEvent = require('../../VoxaEvent');
const _ = require('lodash');

class CortanaEvent extends VoxaEvent {
  constructor(event, context) {
    super(event, context);
    this.type = 'cortana';
    this.session = {
      new: _.isEmpty(_.get(event, 'stateData.privateConversationData')),
      attributes: _.get(event, 'stateData.privateConversationData') || {},
      sessionId: event.conversation.id,
    };
  }

  get intent() {
    if (this._raw.intent) {
      return this._raw.intent;
    }

    const intentEntity = _.find(this._raw.entities, { type: 'Intent' });
    if (!intentEntity) {
      return null;
    }

    if (intentEntity.name === 'Microsoft.Launch') {
      return { name: 'LaunchIntent' };
    }

    return intentEntity;
  }

  get authorization() {
    return this._raw.authorization;
  }

  get user() {
    return _.merge(this._raw.from, { userId: this._raw.from.id });
  }

  get request() {
    let type = this._raw.type;
    if (type === 'endOfConversation') {
      type = 'SessionEndedRequest';
    }

    if (this._raw.type === 'message') {
      type = 'IntentRequest';
    }

    let locale;
    if (this._raw.locale) {
      locale = this._raw.locale;
    } else {
      const entity = _(this._raw.entities)
        .filter({ type: 'clientInfo' })
        .filter(e => e.locale)
        .first();

      if (entity) {
        locale = entity.locale;
      }
    }

    return {
      type,
      locale,
    };
  }
}

module.exports = CortanaEvent;
