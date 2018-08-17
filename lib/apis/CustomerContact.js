'use strict';

const _ = require('lodash');
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
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.givenName'));
  }

  /*
   * Gets user's name
   * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
   */
  getName() {
    return rp(this.getOptions('v2/accounts/~current/settings/Profile.name'));
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
    const info = {
      email: await this.getEmail(),
    };

    try {
      info.givenName = await this.getGivenName();
    } catch (err) {
      //  FIELD IS DISABLED IN THE SKILL'S CONFIGURATION
    }

    try {
      info.name = await this.getName();
    } catch (err) {
      //  FIELD IS DISABLED IN THE SKILL'S CONFIGURATION
    }

    const phoneNumber = await this.getPhoneNumber();

    return _.merge(info, phoneNumber);
  }
}

module.exports = CustomerContact;
