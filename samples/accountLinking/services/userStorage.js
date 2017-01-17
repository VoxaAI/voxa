'use strict';

const config = require('../config');

class UserStorage {
  constructor() {
    const dynasty = require('dynasty')({
      accessKeyId: config.awsCredentials.key,
      secretAccessKey: config.awsCredentials.secret,
    });

    this.userTable = dynasty.table(config.dynamoDB.tables.users);
  }

  get(id) {
    return this.userTable.find(id);
  }

  put(data) {
    return this.userTable.insert(data);
  }
}

module.exports = UserStorage;

