'use strict';

const rp = require('request-promise');
const CortanaRecognizer = require('./CortanaRecognizer');
const CortanaEvent = require('./CortanaEvent');
const _ = require('lodash');

class LuisRecognizer extends CortanaRecognizer {
  constructor(luisUrl, subscriptionKey, timezoneOffset) {
    super();
    this.luisUrl = luisUrl;
    this.subscriptionKey = subscriptionKey;
    this.timezoneOffset = timezoneOffset;
  }

  recognize(rawEvent, context) {
    const requestOptions = {
      method: 'GET',
      url: this.luisUrl,
      json: true,
      qs: {
        'subscription-key': this.subscriptionKey,
        timezoneOffset: this.timezoneOffset,
        q: rawEvent.text,
      },
    };
    return rp(requestOptions)
      .then((luisResponse) => {
        rawEvent.intent = LuisRecognizer.parseLuisResponse(luisResponse);
        return new CortanaEvent(rawEvent, context);
      });
  }

  static parseLuisResponse(luisResponse) {
    const intent = {
      _raw: luisResponse,
      name: luisResponse.topScoringIntent.intent,
      params: _(luisResponse.entities)
        .map(entity => [entity.type, entity.resolution.value])
        .fromPairs()
        .value(),
    };

    return intent;
  }
}

module.exports = LuisRecognizer;
