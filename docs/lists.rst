.. _lists:

Alexa Shopping and To-Do Lists Reference
========================================

Alexa customers have access to two default lists: Alexa to-do and Alexa shopping. In addition, Alexa customer can create and manage `custom lists <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html>`_ in a skill that supports that.

Customers can review and modify their Alexa lists using voice through a device with Alexa or via the Alexa app. For example, a customer can tell Alexa to add items to the Alexa Shopping List at home, and then while at the store, view the items via the Alexa app, and check them off.

With Voxa, you can implement all lists features. In this code snippet you will see how to check if a list exists, if not, it creates one. If it does exist, it will check if an item is already in the list and updates the list with a new version, if no, it adds it:

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

      await alexaEvent.lists.updateList(listMeta.name, 'active', 2);
    } else {
      listInfo = await alexaEvent.lists.createList(listName);
    }

    if (itemInfo) {
      return { reply: 'List.ProductAlreadyInList' };
    }

    await alexaEvent.lists.createItem(listInfo.listId, productName);

    return { reply: 'List.ProductCreated' };
  });

There's also a faster way to consult and/or create a list. Follow this example:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('AddItemToListIntent', async (alexaEvent) => {
    const { productName } = alexaEvent.intent.params;
    const listName = 'MY_CUSTOM_LIST';

    const listInfo = await alexaEvent.lists.getOrCreateList(listName);
    const itemInfo = _.find(listInfo.items, { value: productName });

    if (itemInfo) {
      return { reply: 'List.ProductAlreadyInList' };
    }

    await alexaEvent.lists.createItem(listInfo.listId, productName);

    return { reply: 'List.ProductCreated' };
  });


Let's review another example. Let's say we have an activity in the default To-Do list and we want to mark it as completed. For that, we need to pull down the items from the default To-Do list, find our item and modify it:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('CompleteActivityIntent', async (alexaEvent) => {
    const { activity } = alexaEvent.intent.params;

    const listInfo = await alexaEvent.lists.getDefaultToDoList();
    const itemInfo = _.find(listInfo.items, { value: activity });

    await alexaEvent.lists.updateItem(
      listInfo.listId,
      itemInfo.id,
      activity,
      'completed',
      2);

    return { reply: 'List.ActivityCompleted' };
  });

Let's check another example. Let's say users want to remove an item in their default shopping list that they had already marked as completed. We're going to first fetch the default shopping list's info, then look for the product to remove, we're going to first check if the product is marked as completed to then delete it:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('RemoveProductIntent', async (alexaEvent) => {
    const { productId } = alexaEvent.model;

    const listInfo = await alexaEvent.lists.getDefaultShoppingList();
    const itemInfo = await alexaEvent.lists.getListItem(listInfo.listId, productId);

    if (itemInfo.status === 'active') {
      return { reply: 'List.ConfirmProductDeletion', to: 'wantToDeleteActiveProduct?' };
    }

    await alexaEvent.lists.deleteItem(listInfo.listId, productId);

    return { reply: 'List.ProductRemoved' };
  });

Finally, if you want to remove the list you had created:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('DeleteListIntent', async (alexaEvent) => {
    const listName = 'MY_CUSTOM_LIST';

    const listInfo = await alexaEvent.lists.getOrCreateList(listName);
    await alexaEvent.lists.deleteList(listInfo.listId);

    return { reply: 'List.ListRemoved' };
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
