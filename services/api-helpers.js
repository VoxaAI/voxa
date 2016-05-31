var Promise = require('bluebird')
  , _ = require('lodash')
  , post = Promise.promisify(require('request').post)
  , get = Promise.promisify(require('request').get)
  , basicAuthToken = require('basic-auth-token')
;

exports.issue = issue;
exports.oauthReq = oauthReq;

function issue(method, token, path, queryString, body, options, apiType) {
  var URL = options.endpoint + '/' + apiType  + '/' + options.version + path;

  var qs = _.map(_.assign({}), function (v, k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(v);
  }).join('&'),
      op = method == 'POST' ? post : get,
      url = URL + '?' + qs,
      startTime = +new Date();
  var req = {
    url: url,
    headers: {
      "X-IBM-Client-Id": options.key,
      "X-IBM-Client-Secret": options.secret,
      "Accept": 'application/json'
    },
    strictSSL: _.has(options, 'strictSSL') ? options.strictSSL : false,
    proxy: options.proxy,
  };
  if (apiType == 'account' || apiType == 'payment') {
     req.headers.Authorization = "Bearer " + token;
  }
  if (body && method != 'GET') {
    req.json = true;
    req.body = body;
  }
  if(options.verbose) {
    console.log("REQUEST: " + url);
    if (options.superVerbose) console.log("REQUEST BODY: " + JSON.stringify(req.body));
  }
  return op(req).then(function (res) {
    if (options.verbose) {
      console.log("RESPONSE: " + url + " - " + res.statusCode + " - " + (new Date() - startTime) + 'ms');
    }
    if (res.body && _.isString(res.body)) {
      try {
        res.body = JSON.parse(res.body);
      } catch (e) {
        if (options.verbose) {
          console.log("FAILED TO PARSE:");
          console.log(res.body);
        }
        throw e;
      }
    }
    return res;
  });
}

function oauthReq(grant_type, values, options,apiType) {
  var url = options.endpoint + '/' + apiType + '/' + options.version + '/oauth/token',
      body = _.assign({
    grant_type: grant_type,
    scope: '/'+ apiType + '/v1' //Note: If the API versions, would we need to change this v1?
  }, values),
  startTime = +new Date(),
  headers = {
    "Authorization": "Basic " + basicAuthToken(options.key, options.secret),
      "Accept": 'application/json'
    }
  ;
  if (options.verbose && options.superVerbose) {
    console.log('OAUTHif (options.verbose && options.superVerbose) { Request: ', url);
    console.log('OAUTH Body: ', body);
    console.log('OAUTH Headers: ', headers);
  }
  //if(options.verbose) console.log('Request',url);

  return post({
    url: url,
    headers: headers,
    form: body,
    proxy: options.proxy,
    strictSSL: _.has(options, 'strictSSL') ? options.strictSSL : false,
  }).then(function (res) {
    if (options.verbose) console.log('RESPONSE: ', url, res.statusCode,+new Date() - startTime + 'ms');
    try {
      var tokens = JSON.parse(res.body);
    } catch (e) {
      if (options.verbose) console.log('Failed to parse', url, '"' + res.body + '"');
      throw e;
    }
    if(options.verbose && options.logsAreInsensitive && false) console.log('Tokens:',tokens, grant_type);
    return tokens;
  });
}
