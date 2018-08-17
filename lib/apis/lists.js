'use strict';

const _ = require('lodash');
const rp = require('request-promise');

class Lists {
  constructor(alexaEvent) {
    this.consentToken = _.get(alexaEvent, 'context.System.user.permissions.consentToken');
    this.endpoint = 'https://api.amazonalexa.com/v2/householdlists';
  }

  /*
   * Calls the Alexa's Lists API
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html
   */
  getOptions(path = '', method = 'GET', body = {}) {
    return {
      uri: `${this.endpoint}/${path}`,
      method,
      body,
      headers: {
        Authorization: `Bearer ${this.consentToken}`,
      },
      json: true, // Automatically parses the JSON string in the response
    };
  }

  /*
   * Gets information from the default lists
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  async getDefaultList(listSuffix) {
    const metadata = await rp(this.getOptions());
    const defaultList = _.find(metadata.lists, (currentList) => {
      // According to the alexa lists FAQ available in
      // https://developer.amazon.com/docs/custom-skills/list-faq.html
      // this is the standard way to get the user's default Shopping List

      const buf = Buffer.from(currentList.listId, 'base64');
      return _.endsWith(buf.toString(), listSuffix);
    });

    return defaultList;
  }

  /*
   * Gets information from the default Shopping List
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  getDefaultShoppingList() {
    return this.getDefaultList('SHOPPING_ITEM');
  }

  /*
   * Gets information from the default To-Do List
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  getDefaultToDoList() {
    return this.getDefaultList('TASK');
  }

  /*
   * Gets metadata from all lists in user's account
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getListsMetadata
   */
  getListMetadata() {
    return rp(this.getOptions());
  }

  /*
   * Gets list's information. Items are included
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList
   */
  getListById(listId, status = 'active') {
    return rp(this.getOptions(`${listId}/${status}`));
  }

  /*
   * Looks for a list by name, if not found, it creates it, and returns it
   */
  async getOrCreateList(name) {
    const listsMetadata = await this.getListMetadata();
    const listMeta = _.find(listsMetadata.lists, { name });

    if (listMeta) {
      return this.getListById(listMeta.listId);
    }

    return this.createList(name);
  }

  /*
   * Creates an empty list. The state default value is active
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#createList
   */
  createList(name, state = 'active') {
    return rp(this.getOptions('', 'POST', { name, state }));
  }

  /*
   * Updates list's values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateList
   */
  updateList(listId, name, state = 'active', version) {
    if (typeof name === 'object') {
      return rp(this.getOptions(`${listId}`, 'PUT', name));
    }

    return rp(this.getOptions(`${listId}`, 'PUT', { name, state, version }));
  }

  /*
   * Updates list's values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deletelist
   */
  deleteList(listId) {
    return rp(this.getOptions(`${listId}`, 'DELETE'));
  }

  /*
   * Gets information from a list's item
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getListItem
   */
  getListItem(listId, itemId) {
    return rp(this.getOptions(`${listId}/items/${itemId}`));
  }

  /*
   * Creates an item in a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#createListItem
   */
  createItem(listId, value, status = 'active') {
    return rp(this.getOptions(`${listId}/items`, 'POST', { value, status }));
  }

  /*
   * Updates information from an item in a list: value, status and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateListItem
   */
  updateItem(listId, itemId, value, status, version) {
    if (typeof value === 'object') {
      return rp(this.getOptions(`${listId}/items/${itemId}`, 'PUT', value));
    }

    return rp(this.getOptions(`${listId}/items/${itemId}`, 'PUT', { value, status, version }));
  }

  /*
   * Deletes an item from a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deleteListItem
   */
  deleteItem(listId, itemId) {
    return rp(this.getOptions(`${listId}/items/${itemId}`, 'DELETE'));
  }
}

module.exports = Lists;
