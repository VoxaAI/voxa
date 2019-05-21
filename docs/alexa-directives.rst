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

Voxa provides a `DisplayTemplate` builder that can be used with the `alexaRenderTemplate` controller key to create Display templates for the echo show and echo spot.

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


Alexa Presentation Language (APL) Templates
-------------------------------------------

`Alexa Documentation <https://developer.amazon.com/docs/alexa-presentation-language/apl-overview.html>`_

An APL Template is sent with the `alexaAPLTemplate` key in your controller. You can pass the directive object directly or a view name with the directive object.

One important thing to know is that is you sent a Render Template and a APL Template in the same response but the APL Template will be the one being rendered if the device supports it; if not, the Render Template will be one being rendered.

.. code-block:: javascript

  // variables.js

    exports.MyAPLTemplate = (voxaEvent) => {
      // Do something with the voxaEvent, or not...

      return {
        datasources: {},
        document: {},
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.RenderDocument",
      };
    });

  // views.js

    const views = {
      "en-US": {
        translation: {
          MyAPLTemplate: "{MyAPLTemplate}"
        },
      };
    };

  // state.js

    app.onState('someState', () => {
      return {
        alexaAPLTemplate: "MyAPLTemplate",
      };
    });

    // Or you can do it directly...

    app.onState('someState', () => {
      return {
        alexaAPLTemplate: {
          datasources: {},
          document: {},
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APL.RenderDocument",
        },
      };
    });


Alexa Presentation Language (APL) Commands
------------------------------------------

`Alexa Documentation <https://developer.amazon.com/docs/alexa-presentation-language/apl-commands.html>`_

An APL Command is sent with the `alexaAPLCommand` key in your controller. Just like the APL Template, you can pass the directive object directly or a view name with the directive object.

.. code-block:: javascript

  // variables.js

    exports.MyAPLCommand = (voxaEvent) => {
      // Do something with the voxaEvent, or not...

      return {
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.ExecuteCommands";
        commands: [{
          type: "SpeakItem", // Karaoke type command
          componentId: "someAPLComponent";
        }],
      };
    });

  // views.js

    const views = {
      "en-US": {
        translation: {
          MyAPLCommand: "{MyAPLCommand}"
        },
      };
    };

  // state.js

    app.onState('someState', () => {
      return {
        alexaAPLCommand: "MyAPLCommand",
      };
    });

    // Or you can do it directly...

    app.onState('someState', () => {
      return {
        alexaAPLCommand: {
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APL.ExecuteCommands";
          commands: [{
            type: "SpeakItem", // Karaoke type command
            componentId: "someAPLComponent";
          }],
        },
      };
    });



PlayAudio
---------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#play>`_


.. code-block:: javascript

    function register(app) {
      app.onState('someState', () => {
        const url = 'http://example.com/example.mp3';
        const token = '{}';
        const offsetInMilliseconds = 0;
        const behavior = 'REPLACE_ALL';
        const playAudio = new PlayAudio(url, token, offsetInMilliseconds, behavior);

        return {
          directives: [playAudio],
        };
      });
    }

**Add metadata for your audio**

The `PlayAudio` directive has a fifth parameter to set metadata for an audio, just pass it when creating a `PlayAudio` instance following the correct structure required by Amazon (refer to the Alexa documentation link above).


.. code-block:: javascript

    function register(app) {
      app.onState('someState', () => {
        const url = 'http://example.com/example.mp3';
        const token = '{}';
        const offsetInMilliseconds = 0;
        const behavior = 'REPLACE_ALL';
        const metadata = {
          title: 'title of the track to display',
          subtitle: 'subtitle of the track to display',
          art: {
            sources: [
              {
                url: 'https://cdn.example.com/url-of-the-album-art-image.png'
              }
            ]
          },
          backgroundImage: {
            sources: [
              {
                url: 'https://cdn.example.com/url-of-the-background-image.png'
              }
            ]
          }
        };
        const playAudio = new PlayAudio(url, token, offsetInMilliseconds, behavior, metadata);

        return {
          directives: [playAudio],
        };
      });
    }


StopAudio
---------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#stop>`_


.. code-block:: javascript

  function register(app) {
    app.onState("PauseIntent", {
      alexaStopAudio: true,
      reply: "SomeViewWithAPauseText",
      to: "die"
    });
  }


Resume an Audio
---------

Resuming an audio works using the `PlayAudio` directive, the only thing that need to change is the `offsetInMilliseconds` to, of course, start the audio where it stopped. The `offsetInMilliseconds` comes from the context attribute in the raw event coming from Alexa.

You can also use the `token` to pass important information since the AudioPlayer context is outside of the skill session and since you can't access the session variables. In this example I will pass the url of the audio being reproduced in the Alexa device, but you can pass any variable you need.


.. code-block:: javascript

  function register(app) {
    app.onState("playSomeAudio", () => {
      const url = 'http://example.com/example.mp3';
      const token = JSON.stringify({ url });
      const offsetInMilliseconds = 0;
      const behavior = 'REPLACE_ALL';
      const playAudio = new PlayAudio(url, token, offsetInMilliseconds, behavior);

      return {
        directives: [playAudio],
      };
    });

    app.onIntent("ResumeIntent", (voxaEvent: IVoxaEvent) => {
      if (voxaEvent.rawEvent.context) {
        const token = JSON.parse(voxaEvent.rawEvent.context.AudioPlayer.token);
        const offsetInMilliseconds = voxaEvent.rawEvent.context.AudioPlayer.offsetInMilliseconds;
        const url = token.url;

        const playAudio = new PlayAudio(url, token, offsetInMilliseconds);

        return {
          reply: "SomeViewSayingResumingAudio",
          to: "die",
          directives: [playAudio]
        };
      }

      return { flow: "terminate", reply: "SomeGoodbyeMessage" };
    });
  }


ElicitSlot Directive
----------------------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#elicitslot>`_

When there is an active dialog you can use the ``alexaElicitDialog`` to tell alexa to prompt the user for a specific slot in the next turn.  A prompt passed in as a ``say``, ``reply`` or another statement is required and will replace the prompt that is provided to the interaction model for the dialog.
The ``flow`` and ``to`` keys should not be used or should always be ``flow: "yield"`` and ``to: "{current_intent}"`` since dialogs loop the same intent until all of the parameters are filled.

The only required parameter is the ``slotToElicit``, but you can also pass in the values for slots to update the current values.  If a slot isn't declared in the interaction model it will be ignored or cause an error.


.. code-block:: javascript

    // simplest example
    app.onIntent('someDialogIntent', () => {
      // check if the dialog is complete and do some cool stuff here //

      // if we need to ask the user for something //
      return {
        alexaElicitDialog: {
          slotToElicit: "favoriteColor",
        },
        sayp: ["What is your favorite color?"],
      };
    });

    // updating slots example
    app.onIntent('someDialogIntent', () => {
      // check if the dialog is complete and do some cool stuff here //

      // if we need to ask the user for something //
      return {
        alexaElicitDialog: {
          slotToElicit: "favoriteColor",
          slots: {
            bestLetter: {
              value: "W",
              confirmationStatus: "CONFIRMED",
            },
          },
        },
        sayp: ["What is your favorite color?"],
      };
    });

    // This is still OK
    app.onIntent('someDialogIntent', () => {
      return {
        alexaElicitDialog: {
          slotToElicit: "favoriteColor",
        },
        sayp: ["What is your favorite color?"],
        to: "someDialogIntent",
      };
    });

    // This will break
    app.onIntent('someDialogIntent', () => {
      return {
        alexaElicitDialog: {
          slotToElicit: "favoriteColor",
        },
        sayp: ["What is your favorite color?"],
        to: "someOtherThing",
      };
    });
