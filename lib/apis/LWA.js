'use strict';

const ApiBase = require('./ApiBase');

class LWA extends ApiBase {

  // eslint-disable-next-line class-methods-use-this
  getToken() {
    return undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getEndpoint() {
    return 'https://api.amazon.com';
  }

  /*
   * Gets the user's profile information.
   * https://developer.amazon.com/docs/login-with-amazon/customer-profile.html
   */
  getUserInformation() {
    const accessToken = this.alexaEvent.user.accessToken;
    return this.getResult(`user/profile?access_token=${accessToken}`);
  }
}

module.exports = LWA;
