'use strict';

const config = require('../config');
let dynasty;

class UserStorage {
  constructor() {
    dynasty = require('dynasty')(config.awsCredentials);
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

