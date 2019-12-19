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
    const { DisplayTemplate } = voxa;

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



Alexa Presentation Language - T (APLT) Templates
-------------------------------------------

`Alexa Documentation <https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-reference-character-displays.html>`_

Alexa Presentation Language is supported on devices with character displays. Use the APLT document format to send text to these devices. The APLT document format is smaller and simpler than the APL document format supported by devices with screens.

One important thing to know is that is you sent a Render Template and a APLT Template in the same response but the APLT Template will be the one being rendered if the device supports it; if not, the Render Template will be one being rendered.

.. code-block:: javascript

  // variables.js

    exports.MyAPLTTemplate = (voxaEvent) => {
      // Do something with the voxaEvent, or not...

       return {
        datasources: {},
        document: {},
        targetProfile: "FOUR_CHARACTER_CLOCK",
        token: SkillTemplateToken,
        type: "Alexa.Presentation.APLT.RenderDocument"
      };
    });

  // views.js

    const views = {
      "en-US": {
        translation: {
          MyAPLTTemplate: "{MyAPLTTemplate}"
        },
      };
    };

  // state.js

    app.onState('someState', () => {
      return {
        alexaAPLTTemplate: "MyAPLTTemplate",
      };
    });

    // Or you can do it directly...

    app.onState('someState', () => {
      return {
        alexaAPLTTemplate: {
          datasources: {},
          document: {},
          targetProfile: "FOUR_CHARACTER_CLOCK",
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APLT.RenderDocument",
        },
      };
    });

Alexa Presentation Language - T (APLT) Commands
------------------------------------------

`Alexa Documentation <https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/aplt-interface.html#executecommands-directive>`_

An APLT Command is sent with the `alexaAPLTCommand` key in your controller. Just like the APLT Template, you can pass the directive object directly or a view name with the directive object.


  // variables.js

    exports.MyAPLTCommand = (voxaEvent) => {
      // Do something with the voxaEvent, or not...

      return {
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APLT.ExecuteCommands";
        commands: [ {
          type: "SetValue",
          description:
            "Changes the text property value on the 'myTextId' component.",
          componentId: "myTextId",
          property: "text",
          value: "New text value!",
          delay: 3000
        }]
      };
    });

  // views.js

    const views = {
      "en-US": {
        translation: {
          MyAPLTCommand: "{MyAPLTCommand}"
        },
      };
    };

  // state.js

    app.onState('someState', () => {
      return {
        alexaAPLTCommand: "MyAPLTCommand",
      };
    });

    // Or you can do it directly...

    app.onState('someState', () => {
      return {
        alexaAPLTCommand: {
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APLT.ExecuteCommands";
          commands: [ {
            type: "SetValue",
            description:
              "Changes the text property value on the 'myTextId' component.",
            componentId: "myTextId",
            property: "text",
            value: "New text value!",
            delay: 3000
          }]
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
---------------

Resuming an audio works using the `PlayAudio` directive, the only thing that need to change is the `offsetInMilliseconds` to, of course, start the audio where it stopped. The `offsetInMilliseconds` comes from the context attribute in the raw event coming from Alexa.

You can also use the `token` to pass important information since the AudioPlayer context is outside of the skill session, therefore you can't access the session variables. In this example, the information of the audio is returned with the `alexaPlayAudio` key from Voxa.


.. code-block:: javascript

  function register(app) {
    app.onState("playSomeAudio", () => {
      const url = 'http://example.com/example.mp3';
      const token = JSON.stringify({ url });
      const offsetInMilliseconds = 0;
      const behavior = 'REPLACE_ALL';
      const metadata = {
        art: {
          sources: [
            {
              url: "http://example.com/image.png",
            },
          ],
        },
        backgroundImage: {
          sources: [
            {
              url: "http://example.com/image.png",
            },
          ],
        },
        subtitle: "Subtitle",
        title: "Title",
      };

      return {
        alexaPlayAudio: {
          behavior,
          metadata,
          offsetInMilliseconds,
          token
          url,
        },
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

Dynamic Entities
------------------------------------------

`Alexa Documentation <https://developer.amazon.com/docs/custom-skills/use-dynamic-entities-for-customized-interactions.html>`_

Dynamic entities are sent with the `alexaDynamicEntities` key in your controller. You need to pass a view name with the types array.

.. code-block:: javascript

  // variables.js

    exports.dynamicNames = (voxaEvent) => {
      return [
        {
          name: "LIST_OF_AVAILABLE_NAMES",
          values: [
            {
              id: "nathan",
              name: {
                synonyms: ["nate"],
                value: "nathan"
              }
            }
          ]
        }
      ];
    });

  // views.js

    const views = {
      "en-US": {
        translation: {
          MyAvailableNames: "{dynamicNames}"
        },
      };
    };

  // state.js

    app.onState('someState', () => {
      return {
        alexaDynamicEntities: "MyAvailableNames",
      };
    });

    // Or you can pass the types directly...

    app.onState('someState', () => {
      return {
        alexaDynamicEntities: [
          {
            name: "LIST_OF_AVAILABLE_NAMES",
            values: [
              {
                id: "nathan",
                name: {
                  synonyms: ["nate"],
                  value: "nathan"
                }
              }
            ]
          }
        ],
      };
    });

    // Or you can pass the whole directive directly...

    app.onState('someState', () => {
      return {
        alexaDynamicEntities: {
          type: "Dialog.UpdateDynamicEntities",
          updateBehavior: "REPLACE",
          types: [
            {
              name: "LIST_OF_AVAILABLE_NAMES",
              values: [
                {
                  id: "nathan",
                  name: {
                    synonyms: ["nate"],
                    value: "nathan"
                  }
                }
              ]
            }
          ]
        },
      };
    });

