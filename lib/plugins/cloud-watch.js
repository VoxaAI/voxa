'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('voxa');

function register(skill, cloudwatch, config) {
  if (!config) {
    config = {};
  }

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

  if (config.MetricName) {
    _.set(defaulEventMetric, 'MetricData[0].MetricName', config.MetricName);
  }

  if (config.Namespace) {
    _.set(defaulEventMetric, 'Namespace', config.Namespace);
  }

  const onErrorMetric = _.cloneDeep(defaulEventMetric);
  _.set(onErrorMetric, 'MetricData[0].Value', 1);

  const OnSuccessMetric = _.cloneDeep(defaulEventMetric);
  _.set(OnSuccessMetric, 'MetricData[0].Value', 0);

  const putMetricDataAsync = Promise.promisify(cloudwatch.putMetricData.bind(cloudwatch));

  skill.onBeforeReplySent(alexaEvent => Promise.try(() => {
    _.set(OnSuccessMetric, 'MetricData[0].Timestamp', new Date());
    return putMetricDataAsync(OnSuccessMetric).then((data, error) => {
      debug(`onBeforeReplySent Metric Data Error: ${JSON.stringify(error)}`);
      debug(`onBeforeReplySent Metric Data Success: ${JSON.stringify(data)}`);
      return null;
    });
  }));

  skill.onStateMachineError(alexaEvent => Promise.try(() => {
    _.set(alexaEvent, 'cloudwatch.errorReported', true);
    _.set(onErrorMetric, 'MetricData[0].Timestamp', new Date());

    return putMetricDataAsync(onErrorMetric).then((data, error) => {
      debug(`onStateMachineError Metric Data Error: ${JSON.stringify(error)}`);
      debug(`onStateMachineError Metric Data Success: ${JSON.stringify(data)}`);

      return null;
    });
  }));

  skill.onError(alexaEvent => Promise.try(() => {
    const errorReported = _.get(alexaEvent, 'cloudwatch.errorReported');

    if (!errorReported) {
      _.set(onErrorMetric, 'MetricData[0].Timestamp', new Date());
      return putMetricDataAsync(onErrorMetric).then((data, error) => {
        debug(`onError Metric Data Error: ${JSON.stringify(error)}`);
        debug(`onError Metric Data Success: ${JSON.stringify(data)}`);

        return null;
      });
    }

    return null;
  }));
}

module.exports = register;
