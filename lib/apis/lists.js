'use strict';

const _ = require('lodash');
const rp = require('request-promise');

class Lists {
  constructor(alexaEvent) {
    this.consentToken = _.get(alexaEvent, 'context.System.user.permissions.consentToken');
    this.endpoint = 'https://api.amazonalexa.com/v2/householdlists';
  }

  getOptions(uri = '', method = 'GET', body = {}) {
    return {
      uri: `${this.endpoint}/${uri}`,
      method,
      body,
      headers: {
        Authorization: `Bearer ${this.consentToken}`,
      },
      json: true, // Automatically parses the JSON string in the response
    };
  }

  getDefaultList(listSuffix) {
    return rp(this.getOptions())
      .then((metadata) => {
        const defaultList = _.find(metadata.lists, (currentList) => {
          // According to the alexa lists FAQ available in
          // https://developer.amazon.com/docs/custom-skills/list-faq.html
          // this is the standard way to get the user's default Shopping List

          const buf = Buffer.from(currentList.listId, 'base64');
          return _.endsWith(buf.toString(), listSuffix);
        });

        return defaultList;
      });
  }

  getDefaultShoppingList() {
    return this.getDefaultList('SHOPPING_ITEM');
  }

  getDefaultToDoList() {
    return this.getDefaultList('TASK');
  }

  getListMetadata() {
    return rp(this.getOptions());
  }

  getListById(listId, active = 'active') {
    return rp(this.getOptions(`${listId}/${active}`));
  }

  createList(name, state = 'active') {
    return rp(this.getOptions('', 'POST', { name, state }));
  }

  updateList(listId, name, state = 'active', version) {
    if (typeof name === 'object') {
      return rp(this.getOptions(`${listId}`, 'PUT', name));
    }

    return rp(this.getOptions(`${listId}`, 'PUT', { name, state, version }));
  }

  deleteList(listId) {
    return rp(this.getOptions(`${listId}`, 'DELETE'));
  }

  getListItem(listId, itemId) {
    return rp(this.getOptions(`${listId}/items/${itemId}`));
  }

  createItem(listId, value, status = 'active') {
    return rp(this.getOptions(`${listId}/items`, 'POST', { value, status }));
  }

  updateItem(listId, itemId, value, status, version) {
    if (typeof value === 'object') {
      return rp(this.getOptions(`${listId}/items/${itemId}`, 'PUT', value));
    }

    return rp(this.getOptions(`${listId}/items/${itemId}`, 'PUT', { value, status, version }));
  }

  deleteItem(listId, itemId) {
    return rp(this.getOptions(`${listId}/items/${itemId}`, 'DELETE'));
  }
}

module.exports = Lists;
