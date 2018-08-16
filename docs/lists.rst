.. _lists:

Alexa Shopping and To-Do Lists Reference
========================================

Alexa customers have access to two default lists: Alexa to-do and Alexa shopping. In addition, Alexa customer can create and manage `custom lists <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html>`_ in a skill that supports that.

Customers can review and modify their Alexa lists using voice through a device with Alexa or via the Alexa app. For example, a customer can tell Alexa to add items to the Alexa Shopping List at home, and then while at the store, view the items via the Alexa app, and check them off.

With Voxa, you can implement all lists features. In this code snippet you will see how to check if a list exists, if not, it creates one. If it does exist, it will check if an item is already in the list, if no, it adds it:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('AddItemToListIntent', async (alexaEvent) => {
    const { productName } = alexaEvent.intent.params;
    const listsMetadata = await alexaEvent.lists.getListMetadata();
    const listName = 'MY_CUSTOM_LIST';

    const listMeta = _.find(listsMetadata.lists, { name: listName });
    let itemInfo;
    let listInfo;

    if (listMeta) {
      listInfo = await alexaEvent.lists.getListById(listMeta.listId);
      itemInfo = _.find(listInfo.items, { value: productName });
    } else {
      listInfo = await alexaEvent.lists.createList(listName);
    }

    if (itemInfo) {
      return { reply: 'List.ProductAlreadyInList' };
    }

    await alexaEvent.lists.createItem(listInfo.listId, productName);

    return { reply: 'List.ProductCreated' };
  });


To send a card requesting user the permission to read/write Alexa lists, you can simply add the card object to the view in your `views.js` file with the following format:

.. code-block:: javascript

  NeedShoppingListPermission: {
    tell: 'Before adding an item to your list, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'AskForPermissionsConsent',
      permissions: [
        'read::alexa:household:list',
        'write::alexa:household:list',
      ],
    },
  },
