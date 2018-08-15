.. _inSkillPurchases:

In-Skill Purchases Reference
============================

The `in-skill purchasing <https://developer.amazon.com/docs/in-skill-purchase/isp-overview.html>`_ feature enables you to sell premium content such as game features and interactive stories for use in skills with a custom interaction model.

Buying these products in a skill is seamless to a user. They may ask to shop products, buy products by name, or agree to purchase suggestions you make while they interact with a skill. Customers pay for products using the payment options associated with their Amazon account.

For more information about setting up ISP with the ASK CLI follow this `link <https://developer.amazon.com/docs/in-skill-purchase/use-the-cli-to-manage-in-skill-products.html>`_. And to understand what's the process behind the ISP requests and responses to the Alexa Service click `here <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`_.

With Voxa, you can implement all ISP features like buying, refunding and upselling an item:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('BuyIntent', async (alexaEvent) => {
    const { productName } = alexaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await alexaEvent.isp.buyByReferenceName(productName, token);

    return { directives: buyDirective };
  });

  skill.onIntent('RefundIntent', async (alexaEvent) => {
    const { productName } = alexaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await alexaEvent.isp.cancelByReferenceName(productName, token);

    return { directives: buyDirective };
  });


You can also check if the ISP feature is allowed in a locale or the account is correctly setup in the markets ISP works just by checking with the `isIspAllowed()` function.

.. code-block:: javascript

  skill.onIntent('UpsellIntent', async (alexaEvent) => {
    if (!alexaEvent.isp.isIspAllowed()) {
      return { reply: 'ISP.Invalid', to: 'entry' };
    }

    const { productName } = alexaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await alexaEvent.isp.upsellByReferenceName(productName, upsellMessage, token);

    return { directives: buyDirective };
  });


To get the full list of products and know which ones have been purchased, you can do it like this:

.. code-block:: javascript

  skill.onIntent('ProductsIntent', async (alexaEvent) => {
    const list = await alexaEvent.isp.getProductList();

    alexaEvent.model.productArray = list.inSkillProducts.map(x => x.referenceName);

    return { reply: 'Products.List', to: 'entry' };
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
