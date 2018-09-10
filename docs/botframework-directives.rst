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


.. code-block:: javascript

  import { SuggestedActions } from "botbuilder";
  const suggestedActions = new SuggestedActions().addAction({
    title: "Green",
    type: "imBack",
    value: "productId=1&color=green",
  });

  app.onIntent("LaunchIntent", {
    botframeworkSuggestedActions: suggestedActions,
    to: "die",
  });

Audio Card
----------

.. code-block:: javascript

  import { AudioCard } from "botbuilder";

  const audioCard = new AudioCard().title("Sample audio card");
  audioCard.media([
    {
      profile: "audio.mp3",
      url: "http://example.com/audio.mp3",
    },
  ]);

  app.onIntent("LaunchIntent", {
    botframeworkAudioCard: audioCard,
    to: "die",
  });


Text
----

The ``Text`` directive renders a view and adds it to the response in plain text, this response is then shown to the user in devices with a screen

.. code-block:: javascript

  app.onIntent("LaunchIntent", {
    say: "SomeView",
    text: "SomeView",
    to: "die",
  });

Text P
------

.. code-block:: javascript

  app.onIntent("LaunchIntent", {
    sayp: "Some Text",
    textp: "Some Text",
    to: "die",
  });


Attachments and Attachment Layouts
----------------------------------

.. code-block:: javascript

  const cards = _.map([1, 2, 3], (index: number) => {
    return new HeroCard().title(`Event ${index}`).toAttachment();
  });

  app.onIntent("LaunchIntent", {
    botframeworkAttachmentLayout: AttachmentLayout.carousel,
    botframeworkAttachments: cards,
    to: "die",
  });
