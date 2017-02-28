'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function register(skill, cloudwatch, eventMetric) {
  const defaulEventMetric = {
    MetricData: [
      {
        MetricName: 'Caught Error',
        Timestamp: new Date(),
        Unit: 'Count',
        Value: 1,
      },
    ],
    Namespace: 'StateMachine',
  };

  const eventMetricConfig = _.merge(defaulEventMetric, eventMetric);

  const putMetricDataAsync = Promise.promisify(cloudwatch.putMetricData);
  skill.onStateMachineError(alexaEvent => Promise.try(() => putMetricDataAsync(eventMetricConfig)
  .then(() => {
    _.set(alexaEvent, 'cloudwatch.errorReported', true);
    return null;
  })));


  skill.onError(alexaEvent => Promise.try(() => {
    const errorReported = _.get(alexaEvent, 'cloudwatch.errorReported');

    if (!errorReported) {
      return putMetricDataAsync(eventMetricConfig).then(() => null);
    }

    return null;
  }));
}

module.exports = register;
