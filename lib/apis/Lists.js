'use strict';

const _ = require('lodash');

const ApiBase = require('./ApiBase');

class Lists extends ApiBase {
  constructor(alexaEvent) {
    super(alexaEvent);

    this.authorizationToken = _.get(alexaEvent, 'context.System.user.permissions.consentToken');
    this.endpoint = 'https://api.amazonalexa.com/v2/householdlists';
  }

  /*
   * Gets information from the default lists
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  async getDefaultList(listSuffix) {
    const metadata = await this.getResult();
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
    return this.getResult();
  }

  /*
   * Gets list's information. Items are included
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList
   */
  getListById(listId, status = 'active') {
    return this.getResult(`${listId}/${status}`);
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
    return this.getResult('', 'POST', { name, state });
  }

  /*
   * Updates list's values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateList
   */
  updateList(listId, name, state = 'active', version) {
    if (typeof name === 'object') {
      return this.getResult(`${listId}`, 'PUT', name);
    }

    return this.getResult(`${listId}`, 'PUT', { name, state, version });
  }

  /*
   * Updates list's values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deletelist
   */
  deleteList(listId) {
    return this.getResult(`${listId}`, 'DELETE');
  }

  /*
   * Gets information from a list's item
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getListItem
   */
  getListItem(listId, itemId) {
    return this.getResult(`${listId}/items/${itemId}`);
  }

  /*
   * Creates an item in a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#createListItem
   */
  createItem(listId, value, status = 'active') {
    return this.getResult(`${listId}/items`, 'POST', { value, status });
  }

  /*
   * Updates information from an item in a list: value, status and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateListItem
   */
  updateItem(listId, itemId, value, status, version) {
    if (typeof value === 'object') {
      return this.getResult(`${listId}/items/${itemId}`, 'PUT', value);
    }

    return this.getResult(`${listId}/items/${itemId}`, 'PUT', { value, status, version });
  }

  /*
   * Deletes an item from a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deleteListItem
   */
  deleteItem(listId, itemId) {
    return this.getResult(`${listId}/items/${itemId}`, 'DELETE');
  }
}

module.exports = Lists;
