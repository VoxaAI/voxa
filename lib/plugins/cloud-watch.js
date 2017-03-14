'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function register(skill, cloudwatch, eventMetric) {
  const defaultEventMetric = {
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
  const eventMetricConfig = _.merge(defaultEventMetric, eventMetric);
  const putMetricDataAsync = Promise.promisify(cloudwatch.putMetricData);
  let positiveEvenMetric = defaultEventMetric;

  skill.onBeforeReplySent(alexaEvent => Promise.try(() => {
    positiveEvenMetric = _.merge(positiveEvenMetric, eventMetric);
    return putMetricDataAsync(positiveEvenMetric).then(() => null);
  }));


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
