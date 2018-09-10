.. _botframework-directives:

Botframework Directives
==========================


Sign In Card
------------

A sign in card is used to account link your user. On Cortana the parameters are ignored and the system will use the parameters configured in the cortana channel

.. code-block:: javascript

      app.onIntent("LaunchIntent", {
        botframeworkSigninCard: {
          buttonTitle: "Sign In",
          cardText: "Sign In Card",
          url: "https://example.com",
        },
        to: "die",
      });


Hero Card
---------


.. code-block:: javascript

  import { HeroCard } from "botbuilder";

  const card = new HeroCard()
    .title("Card Title")
    .subtitle("Card Subtitle")
    .text("Some Text");

  app.onIntent("LaunchIntent", {
    botframeworkHeroCard: card,
    to: "die",
  });


Suggested Actions
-----------------

Audio Card
----------

Text
----

Text P
------

Attachments
-----------


Attachment Layout
-----------------
