'use strict';

const npdynamodb = require('npdynamodb');
const AWS = require('aws-sdk');
const config = require('../config');


class UserStorage {
  constructor() {
    const dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
    });
    this.npd = npdynamodb.createClient(dynamodb);
    this.userTable = this.npd()
      .table(config.dynamoDB.tables.users);
  }

  get(id) {
    return this.userTable.where('id', id)
      .first()
      .then(result => result.Item);
  }

  put(data) {
    return this.userTable.create(data);
  }
}

module.exports = UserStorage;
