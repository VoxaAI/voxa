'use strict';

const rp = require('request-promise');
const CortanaRecognizer = require('./CortanaRecognizer');
const CortanaEvent = require('./CortanaEvent');
const _ = require('lodash');
const debug = require('debug')('voxa:cortana');

class LuisRecognizer extends CortanaRecognizer {
  constructor(endpoint) {
    super();
    this.endpoint = endpoint;
  }

  recognize(rawEvent, context) {
    if (!rawEvent.text) {
      return new CortanaEvent(rawEvent, context);
    }

    const requestOptions = {
      method: 'GET',
      url: this.endpoint,
      json: true,
      qs: {
        q: rawEvent.text,
      },
    };
    return rp.call(rp, requestOptions)
      .then((luisResponse) => {
        debug('Luis Recognition Response');
        debug(luisResponse);
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
