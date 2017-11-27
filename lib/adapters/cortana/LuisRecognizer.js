'use strict';

const rp = require('request-promise');
const CortanaRecognizer = require('./CortanaRecognizer');
const CortanaEvent = require('./CortanaEvent');
const _ = require('lodash');

class LuisRecognizer extends CortanaRecognizer {
  constructor(endpoint) {
    super();
    this.endpoint = endpoint;
  }

  recognize(rawEvent, context) {
    const requestOptions = {
      method: 'GET',
      url: this.endpoint,
      json: true,
      qs: {
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
        .map((entity) => {
          if (entity.resolution) {
            if (entity.resolution.value) {
              return [entity.type, entity.resolution.value];
            }

            if (entity.resolution.values) {
              return [entity.type, entity.resolution.values];
            }

            throw new Error('Wrong entity resolution format');
          }

          return [entity.type, entity.entity];
        })
        .fromPairs()
        .value(),
    };

    return intent;
  }
}

module.exports = LuisRecognizer;
