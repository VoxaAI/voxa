'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const ApiBase = require('./ApiBase');

class CustomerContact extends ApiBase {
  constructor(alexaEvent) {
    super(alexaEvent);

    this.authorizationToken = _.get(alexaEvent, 'context.System.apiAccessToken');
    this.endpoint = _.get(alexaEvent, 'context.System.apiEndpoint');

    this.tag = 'CustomerContact';
    this.errorCodeSafeToIgnore = 403;
  }

  /*
   * Gets user's email address
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getEmail() {
    return this.getResult('v2/accounts/~current/settings/Profile.email');
  }

  /*
   * Gets user's given name
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getGivenName() {
    return this.getResult('v2/accounts/~current/settings/Profile.givenName')
      .catch(err => this.checkError(err));
  }

  /*
   * Gets user's name
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getName() {
    return this.getResult('v2/accounts/~current/settings/Profile.name')
      .catch(err => this.checkError(err));
  }

  /*
   * Gets user's phone number
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getPhoneNumber() {
    return this.getResult('v2/accounts/~current/settings/Profile.mobileNumber');
  }

  /*
   * Gets user's full contact information
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  async getFullUserInformation() {
    const infoRequests = [
      this.getEmail(),
      this.getGivenName(),
      this.getName(),
      this.getPhoneNumber(),
    ];

    const [email, givenName, name, phoneNumber] = await Promise.all(infoRequests);
    const info = { email, givenName, name };

    return _.merge(info, phoneNumber);
  }
}

module.exports = CustomerContact;
