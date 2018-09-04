.. _alexa-directives:

Alexa Directives
==========================

HomeCard
-----------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/include-a-card-in-your-skills-response.html>`_


Interactions between a user and an Alexa device can include home cards displayed in the Amazon Alexa App, the companion app available for Fire OS, Android, iOS, and desktop web browsers. These are graphical cards that describe or enhance the voice interaction. A custom skill can include these cards in its responses.


In Voxa you can send cards using a view or returning a Card like structure directly from your controller

.. code-block:: javascript

  const views = {
    "de-DE": {
      translation: {
        Card: {
          image: {
            largeImageUrl: "https://example.com/large.jpg",
            smallImageUrl: "https://example.com/small.jpg",
          },
          title: "Title",
          type: "Standard",
        },
      },
    };


    app.onState('someState', () => {
      return {
        alexaCard: 'Card',
      };
    });


    app.onState('someState', () => {
      return {
        alexaCard: {
          image: {
            largeImageUrl: "https://example.com/large.jpg",
            smallImageUrl: "https://example.com/small.jpg",
          },
          title: "Title",
          type: "Standard",
        },
      };
    });


AccountLinkingCard
------------------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/include-a-card-in-your-skills-response.html#define-a-card-for-use-with-account-linking>`_


An account linking card is sent with the `alexaAccountLinkingCard` key in your controller, it requires no parameters.

.. code-block:: javascript

    app.onState('someState', () => {
      return {
        alexaAccountLinkingCard: null,
      };
    });


RenderTemplate
--------------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/display-interface-reference.html>`_

Voxa provides a `DisplayTemplate` builder that can be used with the `alexaRenderTemplate` controller key to create Displa templates for the echo show and echo spot.

.. code-block:: javascript

    const voxa = require('voxa');
    const { DisplayTemplate } = voxa.alexa;

    app.onState('someState', () => {
      const template = new DisplayTemplate("BodyTemplate1")
        .setToken("token")
        .setTitle("This is the title")
        .setTextContent("This is the text content", "secondaryText", "tertiaryText")
        .setBackgroundImage("http://example.com/image.jpg", "Image Description")
        .setBackButton("HIDDEN");

      return {
        alexaRenderTemplate: template,
      };
    });


PlayAudio
---------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html>`_


.. code-block:: javascript

    const voxa = require('voxa');
    const { PlayAudio } = voxa.alexa;

    app.onState('someState', () => {
      const playAudio = new PlayAudio(
        'http://example.com/example.mp3',
        '{}',
        0,
        'REPLACE_ALL'
      );

      return {
        directives: [playAudio],
      };
    });
