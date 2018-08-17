'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('voxa');
const rp = require('request-promise');

class CustomerContact {
  constructor(alexaEvent) {
    this.apiAccessToken = _.get(alexaEvent, 'context.System.apiAccessToken');
    this.apiEndpoint = _.get(alexaEvent, 'context.System.apiEndpoint');
  }

  /*
   * Calls the Alexa's Customer Contact API
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html
   */
  getOptions(path = '') {
    return {
      uri: `${this.apiEndpoint}/${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiAccessToken}`,
      },
      json: true, // Automatically parses the JSON string in the response
    };
  }

  /*
   * Gets user's email address
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getEmail() {
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.email'));
  }

  /*
   * Gets user's given name
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getGivenName() {
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.givenName'))
      .catch(checkError);
  }

  /*
   * Gets user's name
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getName() {
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.name'))
      .catch(checkError);
  }

  /*
   * Gets user's phone number
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getPhoneNumber() {
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.mobileNumber'));
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

/*
 * Checks if it's safe to ignore errors
 * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#possible-responses
 */
function checkError(err) {
  debug('Customer Contact Error %s', JSON.stringify(err, null, 2));

  if (err.statusCode === 403 || err.error.code === 403) {
    return undefined;
  }

  throw err;
}

module.exports = CustomerContact;
