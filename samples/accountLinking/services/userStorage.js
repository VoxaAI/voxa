'use strict';

const config = require('../config');
const AWS = require('aws-sdk');
const DOC = require('dynamodb-doc');

class UserStorage {
  constructor() {
    const dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
    });
    this.docClient = new DOC.DynamoDB(dynamodb);
    this.userTable = config.dynamoDB.tables.users;
  }

  get(user) {
    const id = user.userId;

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

module.exports = UserStorage;
