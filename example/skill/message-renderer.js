'use strict';

var template = require('../services/template.js'),
    _ = require('lodash'),
    Promise = require('bluebird');

module.exports = function (responses, variables) {

  return function (msgPath, data) {
    var msg = _.cloneDeep(_.at(responses, msgPath)[0]),
        toRender = ['ask', 'tell', 'say', 'reprompt', 'card.title', 'card.content', 'card.text', 'card.image.smallImageUrl', 'card.image.largeImageUrl'];

    return Promise.all(_(toRender).map(function (key) {
      var statement = _.at(msg, key)[0];
      if (!statement) return null;
      return render(statement, data).then(function (rendered) {
        return _.set(msg, key, rendered);
      });
    }).compact().value()).then(function () {
      return msg;
    });
  };

  function render(statement, data) {
    var tokens = template.tokens(statement),
        qVariables = tokens.map(function (token) {
          var variable = variables[token];
          if (!variable) return Promise.reject(new Error('No such variable ' + token));
          return Promise.try(function () {
            return variable(data);
          });
        }),
        qAll = Promise.all(qVariables)
    ;

    return qAll.then(function (vars) {
      var tokensWithVars = _.zip(tokens, vars),
          data = _.fromPairs(tokensWithVars);
      return template(statement, data);
    });
  }
};
