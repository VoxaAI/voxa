'use strict';

/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const Dynasty = require('dynasty');
const https = require('https');

class AutoLoadAdapter {
  constructor() {
    const dynasty = Dynasty({
      accessKeyId: 'FakeAccessKeyId',
      secretAccessKey: 'FakeSecretAccessKey',
      maxRetries: 8,
      httpOptions: {
        /**
        * See known issue: https://github.com/aws/aws-sdk-js/issues/862
        */
        timeout: 4000,
        agent: new https.Agent({
          keepAlive: false,
          rejectUnauthorized: true,
          secureProtocol: 'TLSv1_method',
          ciphers: 'ALL',
        }),
      },
    });

    this.userTable = dynasty.table('FakeTable');
  }

  get(id) {
    return this.userTable.find(id);
  }

  put(data) {
    return this.userTable.insert(data);
  }

}
module.exports = AutoLoadAdapter;


