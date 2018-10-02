/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";

import { AlexaPlatform } from "../../src/platforms/alexa/AlexaPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { AlexaRequestBuilder, isAlexaEvent } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const LIST_ID =
  "YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=";
const LIST_NAME = "MY CUSTOM LIST";

const listMock = {
  lists: [
    {
      listId: LIST_ID,
      name: "Alexa shopping list",
      state: "active",
      statusMap: [
        {
          href: `/v2/householdlists/${LIST_ID}/active`,
          status: "active",
        },
        {
          href: `/v2/householdlists/${LIST_ID}/completed`,
          status: "completed",
        },
      ],
      version: 1,
    },
    {
      listId:
        "YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=",
      name: "Alexa to-do list",
      state: "active",
      statusMap: [
        {
          href:
            "/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/active",
          status: "active",
        },
        {
          href:
            "/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/completed",
          status: "completed",
        },
      ],
      version: 1,
    },
  ],
};

const listCreatedMock = {
  listId: "listId",
  name: LIST_NAME,
  state: "active",
  statusMap: [
    {
      href: "/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/active",
      status: "active",
    },
    {
      href: "/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/completed",
      status: "completed",
    },
  ],
  version: 1,
};

const listByIdMock = {
  items: [{ id: "1", name: "milk" }, { id: "2", name: "eggs" }],
  listId: "listId",
  name: LIST_NAME,
  state: "active",
  version: 1,
};

const itemCreatedMock = {
  createdTime: "Thu Aug 16 14:42:54 UTC 2018",
  href:
    "/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/items/0701d6ee-f407-458d-87ad-41b5bb8381bf",
  id: "id",
  status: "active",
  updatedTime: "Thu Aug 16 14:42:54 UTC 2018",
  value: "milk",
  version: 1,
};

describe("Lists", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    event = rb.getIntentRequest("AddProductToListIntent", {
      productName: "milk",
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should create a custom list and create an item", async () => {
    const reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${
        event.context.System.user.permissions.consentToken
      }`,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    nock("https://api.amazonalexa.com", { reqheaders })
      .persist()
      .get("/v2/householdlists/")
      .reply(200, JSON.stringify(listMock))
      .persist()
      .post("/v2/householdlists/", { name: LIST_NAME, state: "active" })
      .reply(200, JSON.stringify(listCreatedMock))
      .persist()
      .post("/v2/householdlists/listId/items", {
        value: "milk",
        status: "active",
      })
      .reply(200, JSON.stringify(itemCreatedMock));

    alexaSkill.onIntent("AddProductToListIntent", async (voxaEvent) => {
      const { productName } = _.get(voxaEvent, "intent.params");
      let listInfo: any;

      if (isAlexaEvent(voxaEvent)) {
        listInfo = await voxaEvent.alexa.lists.getOrCreateList(LIST_NAME);
      }

      let listItem: any = _.find(listInfo.items, { name: productName });

      if (listItem) {
        return false;
      }

      if (isAlexaEvent(voxaEvent)) {
        listItem = await voxaEvent.alexa.lists.createItem(
          listInfo.listId,
          productName,
        );
      }

      if (listItem) {
        return { tell: "Lists.ProductCreated" };
      }

      return { tell: "Lists.AlreadyCreated" };
    });

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Product has been successfully created",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should modify custom list, and modify an item", async () => {
    const reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${
        event.context.System.user.permissions.consentToken
      }`,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const value = "NEW NAME";
    const newListName = "NEW LIST";

    const customListMock: any = _.cloneDeep(listMock);
    customListMock.lists.push({ listId: "listId", name: LIST_NAME });

    const customItemCreatedMock: any = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    nock("https://api.amazonalexa.com", { reqheaders })
      .persist()
      .get("/v2/householdlists/")
      .reply(200, JSON.stringify(customListMock))
      .persist()
      .get("/v2/householdlists/listId/active")
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put("/v2/householdlists/listId", {
        name: newListName,
        state: "active",
        version: 1,
      })
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put("/v2/householdlists/listId/items/1", {
        value,
        status: "active",
        version: 1,
      })
      .reply(200, JSON.stringify(customItemCreatedMock));

    event.request.intent.name = "ModifyProductInListIntent";

    alexaSkill.onIntent("ModifyProductInListIntent", async (voxaEvent) => {
      const { productName } = _.get(voxaEvent, "intent.params");

      if (isAlexaEvent(voxaEvent)) {
        const listInfo = await voxaEvent.alexa.lists.getOrCreateList(LIST_NAME);
        listInfo.listId = listInfo.listId || "";

        await voxaEvent.alexa.lists.updateList(
          listInfo.listId,
          newListName,
          "active",
          1,
        );

        const listItem: any = _.find(_.get(listInfo, "items"), {
          name: productName,
        });

        await voxaEvent.alexa.lists.updateItem(
          listInfo.listId,
          listItem.id,
          value,
          "active",
          1,
        );
      }

      return { tell: "Lists.ProductModified" };
    });

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Product has been successfully modified",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should delete item from list, and delete list", async () => {
    const reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${
        event.context.System.user.permissions.consentToken
      }`,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const value = "NEW NAME";

    const customItemCreatedMock: any = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    nock("https://api.amazonalexa.com", { reqheaders })
      .persist()
      .delete("/v2/householdlists/listId")
      .reply(200)
      .persist()
      .delete("/v2/householdlists/listId/items/1")
      .reply(200);

    event.request.intent.name = "DeleteIntent";

    alexaSkill.onIntent("DeleteIntent", (voxaEvent) => {
      if (isAlexaEvent(voxaEvent)) {
        return voxaEvent.alexa.lists
          .deleteItem("listId", "1")
          .then(() => voxaEvent.alexa.lists.deleteList("listId"))
          .then(() => ({ tell: "Lists.ListDeleted" }));
      }
    });

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "List has been successfully deleted",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should show the lists with at least 1 item", async () => {
    const reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${
        event.context.System.user.permissions.consentToken
      }`,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const value = "NEW NAME";
    const newListName = "NEW LIST";

    const customItemCreatedMock: any = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    const shoppintListMock = _.cloneDeep(listByIdMock);
    shoppintListMock.name = "Alexa shopping list";

    const toDoListMock = _.cloneDeep(listByIdMock);
    toDoListMock.name = "Alexa to-do list";

    nock("https://api.amazonalexa.com", { reqheaders })
      .persist()
      .get("/v2/householdlists/")
      .reply(200, JSON.stringify(listMock))
      .persist()
      .get("/v2/householdlists/listId/active")
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .get(
        "/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=/active",
      )
      .reply(200, JSON.stringify(shoppintListMock))
      .persist()
      .get(
        "/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/active",
      )
      .reply(200, JSON.stringify(toDoListMock))
      .persist()
      .put("/v2/householdlists/listId", {
        name: newListName,
        state: "active",
        version: 1,
      })
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put("/v2/householdlists/listId/items/1", {
        value,
        status: "active",
        version: 1,
      })
      .reply(200, JSON.stringify(customItemCreatedMock))
      .persist()
      .get("/v2/householdlists/listId/items/1")
      .reply(200, JSON.stringify(customItemCreatedMock));

    event.request.intent.name = "ShowIntent";

    alexaSkill.onIntent("ShowIntent", async (voxaEvent) => {
      const listsWithItems = [];

      if (isAlexaEvent(voxaEvent)) {
        const listMetadataInfo = await voxaEvent.alexa.lists.getDefaultShoppingList();
        listMetadataInfo.listId = listMetadataInfo.listId || "";

        let listInfo = await voxaEvent.alexa.lists.getListById(
          listMetadataInfo.listId,
        );

        if (!_.isEmpty(listInfo.items)) {
          listsWithItems.push(listInfo.name);
        }

        listInfo = await voxaEvent.alexa.lists.getDefaultToDoList();
        listInfo.listId = listInfo.listId || "";

        listInfo = await voxaEvent.alexa.lists.getListById(listInfo.listId);

        if (!_.isEmpty(listInfo.items)) {
          listsWithItems.push(listInfo.name);
        }

        listInfo = await voxaEvent.alexa.lists.getListById("listId");
        listInfo.listId = listInfo.listId || "";

        if (!_.isEmpty(listInfo.items)) {
          listsWithItems.push(listInfo.name);
        }

        voxaEvent.model.listsWithItems = listsWithItems;

        let data: any = {
          name: newListName,
          state: "active",
          version: 1,
        };

        listInfo = await voxaEvent.alexa.lists.updateList(
          listInfo.listId,
          data,
        );
        listInfo.listId = listInfo.listId || "";

        const itemInfo = await voxaEvent.alexa.lists.getListItem(
          listInfo.listId,
          "1",
        );

        data = {
          status: itemInfo.status,
          value,
          version: 1,
        };

        await voxaEvent.alexa.lists.updateItem(listInfo.listId, "1", data);
      }

      return { tell: "Lists.WithItems" };
    });

    const reply = await alexaSkill.execute(event);
    const outputSpeech = `Lists with items are: Alexa shopping list, Alexa to-do list, and ${LIST_NAME}`;

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
