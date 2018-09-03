.. _inSkillPurchases:

In-Skill Purchases Reference
============================

The `in-skill purchasing <https://developer.amazon.com/docs/in-skill-purchase/isp-overview.html>`_ feature enables you to sell premium content such as game features and interactive stories for use in skills with a custom interaction model.

Buying these products in a skill is seamless to a user. They may ask to shop products, buy products by name, or agree to purchase suggestions you make while they interact with a skill. Customers pay for products using the payment options associated with their Amazon account.

For more information about setting up ISP with the ASK CLI follow this `link <https://developer.amazon.com/docs/in-skill-purchase/use-the-cli-to-manage-in-skill-products.html>`_. And to understand what's the process behind the ISP requests and responses to the Alexa Service click `here <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`_.

With Voxa, you can implement all ISP features like buying, refunding and upselling an item:

.. code-block:: javascript

  skill.onIntent('BuyIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.buyByReferenceName(productName, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });

  skill.onIntent('RefundIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.cancelByReferenceName(productName, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });


You can also check if the ISP feature is allowed in a locale or the account is correctly setup in the markets ISP works just by checking with the `isAllowed()` function.

.. code-block:: javascript

  skill.onIntent('UpsellIntent', async (voxaEvent) => {
    if (!voxaEvent.alexa.isp.isAllowed()) {
      return { ask: 'ISP.Invalid', to: 'entry' };
    }

    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.upsellByReferenceName(productName, upsellMessage, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });


To get the full list of products and know which ones have been purchased, you can do it like this:

.. code-block:: javascript

  skill.onIntent('ProductsIntent', async (voxaEvent) => {
    const list = await voxaEvent.alexa.isp.getProductList();

    voxaEvent.model.productArray = list.inSkillProducts.map(x => x.referenceName);

    return { ask: 'Products.List', to: 'entry' };
  });


When users accept or refuse to buy/cancel an item, Alexa sends a Connections.Response directive. A very simple example on how the Connections.Response JSON request from Alexa looks like is:

.. code-block:: json

  {
    "type": "Connections.Response",
    "requestId": "string",
    "timestamp": "string",
    "name": "Upsell",
    "status": {
      "code": "string",
      "message": "string"
    },
    "payload": {
      "purchaseResult": "ACCEPTED",
      "productId": "string",
      "message": "optional additional message"
    },
    "token": "string"
  }
