'use strict';

/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const AWS = require('aws-sdk');
const DOC = require('dynamodb-doc');

class AutoLoadAdapter {
  constructor() {
    const dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
    });
    this.docClient = new DOC.DynamoDB(dynamodb);
    this.userTable = 'Users';
  }

  get(id) {
    return new Promise((resolve, reject) => {
      this.docClient.getItem({
        TableName: this.userTable,
        Key: { id },
      }, (err, item) => {
        if (err) return reject(err);
        return resolve(item.Item);
      });
    });
  }

  put(data) {
    return new Promise((resolve, reject) => {
      this.docClient.putItem({
        TableName: this.userTable,
        Item: data,
      }, (err, item) => {
        if (err) return reject(err);
        return resolve(item);
      });
    });
  }
}

module.exports = AutoLoadAdapter;
