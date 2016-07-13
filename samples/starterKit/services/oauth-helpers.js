'use strict';

var _ = require('lodash'),
    url = require('url'),
    crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

module.exports = function OAuthHelper(options) {
  var cipher = function cipher() {
    return crypto.createCipher(algorithm, options.codeKey);
  },
      decipher = function decipher() {
    return crypto.createDecipher(algorithm, options.codeKey);
  };
  return {
    redirectTo: function redirectTo(state, code) {
      console.log("redirect to 1");
      return exports.redirectTo(state, code, options.redirectUrl, options.token_expiration, options.grant_type);
    },
    encryptTokens: function encryptTokens(tokens) {
      return exports.encryptTokens(tokens, cipher());
    },
    decryptCode: function decryptCode(code) {
      return exports.decryptCode(code, decipher());
    },
    authenticate: function authenticate(creds) {
      return exports.authenticate(creds, options.clientId, options.clientSecret);
    }
  };
};

exports.authenticate = function (credentials, clientId, clientSecret) {
  return credentials.name == clientId && credentials.pass == clientSecret;
};

exports.encryptTokens = function (tokens, cipher) {
  var data = JSON.stringify(tokens);
  var crypted = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
  return crypted;
};

exports.decryptCode = function (code, decipher) {
  code = decodeURIComponent(code);
  var decrypted = decipher.update(code, 'base64', 'utf8');
  decipher.final('utf8');
  return JSON.parse(decrypted);
};

exports.redirectTo = function (state, code, redirectUrl, token_expiration, grant_type) {
  var uri = url.parse(redirectUrl, true);
  var grant_type = grant_type || 'auth_code';
  delete uri.search;
  if (grant_type == 'implicit') {
    uri.hash = exports.querystring({ "state": state, "access_token": code, "expires_in": token_expiration });
  } else {  // Authorization Code Grant
    uri.query.code = code;
    uri.query.state = state;
  }
  console.log('redirect to ' + url.format(uri));
  return url.format(uri);
};

exports.querystring = function(obj) {
  return _.map(obj,function(v,k){
    return encodeURIComponent(k) + '=' + encodeURIComponent(v);
  }).join('&');
};