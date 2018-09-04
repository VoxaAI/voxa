import { services } from "ask-sdk-model";
import * as _ from "lodash";

import { ApiBase } from "./ApiBase";

export class Lists extends ApiBase {
  /*
   * Gets information from the default Shopping List
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  public getDefaultShoppingList(): Promise<services.listManagement.AlexaListMetadata> {
    return this.getDefaultList("SHOPPING_ITEM");
  }

  /*
   * Gets information from the default To-Do List
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  public getDefaultToDoList(): Promise<services.listManagement.AlexaListMetadata> {
    return this.getDefaultList("TASK");
  }

  /*
   * Gets metadata from all lists in user"s account
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getListsMetadata
   */
  public getListMetadata(): Promise<services.listManagement.AlexaListsMetadata> {
    return this.getResult();
  }

  /*
   * Gets list"s information. Items are included
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList
   */
  public getListById(listId: string, status = "active"): Promise<services.listManagement.AlexaList> {
    return this.getResult(`${listId}/${status}`);
  }

  /*
   * Looks for a list by name, if not found, it creates it, and returns it
   */
  public async getOrCreateList(name: string): Promise<services.listManagement.AlexaList | services.listManagement.AlexaListMetadata> {
    const listsMetadata: services.listManagement.AlexaListsMetadata = await this.getListMetadata();
    const listMeta: services.listManagement.AlexaListMetadata|undefined = _.find(listsMetadata.lists, { name });

    if (listMeta) {
      listMeta.listId = listMeta.listId || "";
      return this.getListById(listMeta.listId);
    }

    return this.createList(name);
  }

  /*
   * Creates an empty list. The state default value is active
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#createList
   */
  public createList(name: string, state = "active"): Promise<services.listManagement.AlexaListMetadata> {
    return this.getResult("", "POST", { name, state });
  }

  /*
   * Updates list"s values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateList
   */
  public updateList(listId: string, name: string, state?: string, version?: number): Promise<services.listManagement.AlexaListMetadata> {
    if (typeof name === "object") {
      return this.getResult(`${listId}`, "PUT", name);
    }

    state = state || "active";

    return this.getResult(`${listId}`, "PUT", { name, state, version });
  }

  /*
   * Updates list"s values like: name, state and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deletelist
   */
  public deleteList(listId: string) {
    return this.getResult(`${listId}`, "DELETE");
  }

  /*
   * Gets information from a list"s item
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getListItem
   */
  public getListItem(listId: string, itemId: string): Promise<services.listManagement.AlexaListItem> {
    return this.getResult(`${listId}/items/${itemId}`);
  }

  /*
   * Creates an item in a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#createListItem
   */
  public createItem(listId: string, value: string, status = "active"): Promise<services.listManagement.AlexaListItem> {
    return this.getResult(`${listId}/items`, "POST", { value, status });
  }

  /*
   * Updates information from an item in a list: value, status and version
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#updateListItem
   */
  public updateItem(listId: string, itemId: string, value: string, status?: string, version?: number): Promise<services.listManagement.AlexaListItem> {
    if (typeof value === "object") {
      return this.getResult(`${listId}/items/${itemId}`, "PUT", value);
    }

    return this.getResult(`${listId}/items/${itemId}`, "PUT", { value, status, version });
  }

  /*
   * Deletes an item from a list
   * https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#deleteListItem
   */
  public deleteItem(listId: string, itemId: string) {
    return this.getResult(`${listId}/items/${itemId}`, "DELETE");
  }

  protected getToken() {
    return _.get(this.rawEvent, "context.System.user.permissions.consentToken");
  }

  // eslint-disable-next-line class-methods-use-this
  protected getEndpoint() {
    return "https://api.amazonalexa.com/v2/householdlists";
  }

  /*
   * Gets information from the default lists
   * https://developer.amazon.com/docs/custom-skills/list-faq.html
   */
  private async getDefaultList(listSuffix: string): Promise<services.listManagement.AlexaListMetadata> {
    const metadata: any = await this.getResult();
    const defaultList: any = _.find(metadata.lists, (currentList: any) => {
      // According to the alexa lists FAQ available in
      // https://developer.amazon.com/docs/custom-skills/list-faq.html
      // this is the standard way to get the user"s default Shopping List

      const buf = Buffer.from(currentList.listId, "base64");
      return _.endsWith(buf.toString(), listSuffix);
    });

    return defaultList;
  }
}
