'use strict';

const _ = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');

const StateMachineSkill = require('../lib/StateMachineSkill.js');
const views = require('./views');
const variables = require('./variables');

chai.use(chaiAsPromised);
const expect = chai.expect;

const LIST_NAME = 'MY CUSTOM LIST';

const listMock = {
  lists: [
    {
      listId: 'YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=',
      name: 'Alexa shopping list',
      state: 'active',
      statusMap: [
        {
          href: '/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=/active',
          status: 'active',
        },
        {
          href: '/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=/completed',
          status: 'completed',
        },
      ],
      version: 1,
    },
    {
      listId: 'YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=',
      name: 'Alexa to-do list',
      state: 'active',
      statusMap: [
        {
          href: '/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/active',
          status: 'active',
        },
        {
          href: '/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/completed',
          status: 'completed',
        },
      ],
      version: 1,
    },
  ],
};

const listCreatedMock = {
  listId: 'listId',
  name: LIST_NAME,
  state: 'active',
  statusMap: [
    {
      href: '/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/active',
      status: 'active',
    },
    {
      href: '/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/completed',
      status: 'completed',
    },
  ],
  version: 1,
};

const listByIdMock = {
  listId: 'listId',
  name: LIST_NAME,
  state: 'active',
  items: [
    { id: '1', name: 'milk' },
    { id: '2', name: 'eggs' },
  ],
  version: 1,
};

const itemCreatedMock = {
  createdTime: 'Thu Aug 16 14:42:54 UTC 2018',
  href: '/v2/householdlists/c73aa488-ba0c-433a-a8c7-33f84b8361ba/items/0701d6ee-f407-458d-87ad-41b5bb8381bf',
  id: 'id',
  status: 'active',
  updatedTime: 'Thu Aug 16 14:42:54 UTC 2018',
  value: 'milk',
  version: 1,
};

describe('Lists', () => {
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        locale: 'en-US',
        intent: {
          name: 'AddProductToListIntent',
          slots: {
            productName: { name: 'productName', value: 'milk' },
          },
        },
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
      context: {
        System: {
          user: {
            permissions: {
              consentToken: 'consentToken',
            },
          },
        },
      },
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should create a custom list and create an item', () => {
    const reqheaders = {
      'content-type': 'application/json',
      authorization: 'Bearer consentToken',
      host: 'api.amazonalexa.com',
      accept: 'application/json',
    };

    nock('https://api.amazonalexa.com', { reqheaders })
      .persist()
      .get('/v2/householdlists/')
      .reply(200, JSON.stringify(listMock))
      .persist()
      .post('/v2/householdlists/', { name: LIST_NAME, state: 'active' })
      .reply(200, JSON.stringify(listCreatedMock))
      .persist()
      .post('/v2/householdlists/listId/items', { value: 'milk', status: 'active' })
      .reply(200, JSON.stringify(itemCreatedMock));

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('AddProductToListIntent', (alexaEvent) => {
      const { productName } = alexaEvent.intent.params;

      return alexaEvent.lists.getOrCreateList(LIST_NAME)
        .then((listInfo) => {
          const listItem = _.find(listInfo.items, { name: productName });

          if (listItem) {
            return false;
          }

          return alexaEvent.lists.createItem(listInfo.listId, productName);
        })
        .then((listItem) => {
          if (listItem) {
            return { reply: 'Lists.ProductCreated' };
          }

          return { reply: 'Lists.AlreadyCreated' };
        });
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Product has been successfully created');
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should modify custom list, and modify an item', () => {
    const reqheaders = {
      'content-type': 'application/json',
      authorization: 'Bearer consentToken',
      host: 'api.amazonalexa.com',
      accept: 'application/json',
    };

    const value = 'NEW NAME';
    const newListName = 'NEW LIST';

    const customListMock = _.cloneDeep(listMock);
    customListMock.lists.push({ listId: 'listId', name: LIST_NAME });

    const customItemCreatedMock = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    nock('https://api.amazonalexa.com', { reqheaders })
      .persist()
      .get('/v2/householdlists/')
      .reply(200, JSON.stringify(customListMock))
      .persist()
      .get('/v2/householdlists/listId/active')
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put('/v2/householdlists/listId', { name: newListName, state: 'active', version: 1 })
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put('/v2/householdlists/listId/items/1', { value, status: 'active', version: 1 })
      .reply(200, JSON.stringify(customItemCreatedMock));

    event.request.intent.name = 'ModifyProductInListIntent';

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('ModifyProductInListIntent', (alexaEvent) => {
      const { productName } = alexaEvent.intent.params;

      return alexaEvent.lists.getOrCreateList(LIST_NAME)
        .then(listInfo => alexaEvent.lists.updateList(listInfo.listId, newListName, 'active', 1))
        .then((listInfo) => {
          const listItem = _.find(listInfo.items, { name: productName });

          return alexaEvent.lists.updateItem(listInfo.listId, listItem.id, value, 'active', 1);
        })
        .then(() => ({ reply: 'Lists.ProductModified' }));
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Product has been successfully modified');
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should delete item from list, and delete list', () => {
    const reqheaders = {
      'content-type': 'application/json',
      authorization: 'Bearer consentToken',
      host: 'api.amazonalexa.com',
      accept: 'application/json',
    };

    const value = 'NEW NAME';

    const customItemCreatedMock = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    nock('https://api.amazonalexa.com', { reqheaders })
      .persist()
      .delete('/v2/householdlists/listId')
      .reply(200)
      .persist()
      .delete('/v2/householdlists/listId/items/1')
      .reply(200);

    event.request.intent.name = 'DeleteIntent';

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('DeleteIntent', alexaEvent => alexaEvent.lists.deleteItem('listId', 1)
      .then(() => alexaEvent.lists.deleteList('listId'))
      .then(() => ({ reply: 'Lists.ListDeleted' })));

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('List has been successfully deleted');
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });

  it('should show the lists with at least 1 item', () => {
    const reqheaders = {
      'content-type': 'application/json',
      authorization: 'Bearer consentToken',
      host: 'api.amazonalexa.com',
      accept: 'application/json',
    };

    const value = 'NEW NAME';
    const newListName = 'NEW LIST';

    const customItemCreatedMock = _.cloneDeep(itemCreatedMock);
    customItemCreatedMock.name = value;

    const shoppintListMock = _.cloneDeep(listByIdMock);
    shoppintListMock.name = 'Alexa shopping list';

    const toDoListMock = _.cloneDeep(listByIdMock);
    toDoListMock.name = 'Alexa to-do list';

    nock('https://api.amazonalexa.com', { reqheaders })
      .persist()
      .get('/v2/householdlists/')
      .reply(200, JSON.stringify(listMock))
      .persist()
      .get('/v2/householdlists/listId/active')
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .get('/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVNIT1BQSU5HX0lURU0=/active')
      .reply(200, JSON.stringify(shoppintListMock))
      .persist()
      .get('/v2/householdlists/YW16bjEuYWNjb3VudC5BRkdDNTRFVFI1MkxIS1JMMjZQUkdEM0FYWkdBLVRBU0s=/active')
      .reply(200, JSON.stringify(toDoListMock))
      .persist()
      .put('/v2/householdlists/listId', { name: newListName, state: 'active', version: 1 })
      .reply(200, JSON.stringify(listByIdMock))
      .persist()
      .put('/v2/householdlists/listId/items/1', { value, status: 'active', version: 1 })
      .reply(200, JSON.stringify(customItemCreatedMock))
      .persist()
      .get('/v2/householdlists/listId/items/1')
      .reply(200, JSON.stringify(customItemCreatedMock));

    event.request.intent.name = 'ShowIntent';

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('ShowIntent', (alexaEvent) => {
      const listsWithItems = [];
      let listId;

      return alexaEvent.lists.getDefaultShoppingList()
        .then(listInfo => alexaEvent.lists.getListById(listInfo.listId))
        .then((listInfo) => {
          if (!_.isEmpty(listInfo.items)) {
            listsWithItems.push(listInfo.name);
          }

          return alexaEvent.lists.getDefaultToDoList();
        })
        .then(listInfo => alexaEvent.lists.getListById(listInfo.listId))
        .then((listInfo) => {
          if (!_.isEmpty(listInfo.items)) {
            listsWithItems.push(listInfo.name);
          }

          return alexaEvent.lists.getListById('listId');
        })
        .then((listInfo) => {
          if (!_.isEmpty(listInfo.items)) {
            listsWithItems.push(listInfo.name);
          }

          alexaEvent.model.listsWithItems = listsWithItems;

          const data = {
            name: newListName,
            state: 'active',
            version: 1,
          };

          return alexaEvent.lists.updateList(listInfo.listId, data);
        })
        .then((listInfo) => {
          listId = listInfo.listId;

          return alexaEvent.lists.getListItem(listId, 1);
        })
        .then((itemInfo) => {
          const data = {
            value,
            status: itemInfo.status,
            version: 1,
          };

          return alexaEvent.lists.updateItem(listId, 1, data);
        })
        .then(() => ({ reply: 'Lists.WithItmes' }));
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal(`Lists with items are: Alexa shopping list, Alexa to-do list, and ${LIST_NAME}`);
        expect(reply.msg.reprompt).to.be.empty;
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });
});
