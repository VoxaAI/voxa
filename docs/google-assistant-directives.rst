.. _google-assistant-directives:

Google Assistant Directives
===========================

Dialog Flow directives expose google actions functionality that's platform specific. In general they take the same parameters you would pass to the Actions on Google Node JS SDK.

List
-----

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#list>`_

The single-select list presents the user with a vertical list of multiple items and allows the user to select a single one. Selecting an item from the list generates a user query (chat bubble) containing the title of the list item.


.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowList: {
        title: 'List Title',
        items: {
          // Add the first item to the list
          [SELECTION_KEY_ONE]: {
            synonyms: [
              'synonym of title 1',
              'synonym of title 2',
              'synonym of title 3',
            ],
            title: 'Title of First List Item',
            description: 'This is a description of a list item.',
            image: new Image({
              url: IMG_URL_AOG,
              alt: 'Image alternate text',
            }),
          },
          // Add the second item to the list
          [SELECTION_KEY_GOOGLE_HOME]: {
            synonyms: [
              'Google Home Assistant',
              'Assistant on the Google Home',
          ],
            title: 'Google Home',
            description: 'Google Home is a voice-activated speaker powered by ' +
              'the Google Assistant.',
            image: new Image({
              url: IMG_URL_GOOGLE_HOME,
              alt: 'Google Home',
            }),
          },
          // Add the third item to the list
          [SELECTION_KEY_GOOGLE_PIXEL]: {
            synonyms: [
              'Google Pixel XL',
              'Pixel',
              'Pixel XL',
            ],
            title: 'Google Pixel',
            description: 'Pixel. Phone by Google.',
            image: new Image({
              url: IMG_URL_GOOGLE_PIXEL,
              alt: 'Google Pixel',
            }),
          },
        },
      }
    }
  });


Carousel
----------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#carousel>`_

The carousel scrolls horizontally and allows for selecting one item. Compared to the list selector, it has large tiles-allowing for richer content. The tiles that make up a carousel are similar to the basic card with image. Selecting an item from the carousel will simply generate a chat bubble as the response just like with list selector.


.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowCarousel: {
        items: {
          // Add the first item to the carousel
          [SELECTION_KEY_ONE]: {
            synonyms: [
              'synonym of title 1',
              'synonym of title 2',
              'synonym of title 3',
            ],
            title: 'Title of First Carousel Item',
            description: 'This is a description of a carousel item.',
            image: new Image({
              url: IMG_URL_AOG,
              alt: 'Image alternate text',
            }),
          },
          // Add the second item to the carousel
          [SELECTION_KEY_GOOGLE_HOME]: {
            synonyms: [
              'Google Home Assistant',
              'Assistant on the Google Home',
          ],
            title: 'Google Home',
            description: 'Google Home is a voice-activated speaker powered by ' +
              'the Google Assistant.',
            image: new Image({
              url: IMG_URL_GOOGLE_HOME,
              alt: 'Google Home',
            }),
          },
          // Add third item to the carousel
          [SELECTION_KEY_GOOGLE_PIXEL]: {
            synonyms: [
              'Google Pixel XL',
              'Pixel',
              'Pixel XL',
            ],
            title: 'Google Pixel',
            description: 'Pixel. Phone by Google.',
            image: new Image({
              url: IMG_URL_GOOGLE_PIXEL,
              alt: 'Google Pixel',
            }),
          },
        },
      }
    }
  });

Browse Carousel
----------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#browsing_carousel>`_

A browsing carousel is a rich response that allows users to scroll vertically and select a tile in a collection. Browsing carousels are designed specifically for web content by opening the selected tile in a web browser.


.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowBrowseCarousel: {
        items: [
          {
            title: 'Title of the item',
            description: 'This is a description of an item.',
            footer: 'Footer of the item'
            openUrlAction: {
              url: 'https://example.com/page',
              urlTypeHint: 'DEFAULT' // Optional
            }
          },
          {
            title: 'Title of the item',
            description: 'This is a description of an item.',
            footer: 'Footer of the item'
            openUrlAction: {
              url: 'https://example.com/page',
              urlTypeHint: 'DEFAULT' // Optional
            }
          },
        ],
      }
    }
  });

Suggestions
------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#suggestion_chip>`_

Use suggestion chips to hint at responses to continue or pivot the conversation. If during the conversation there is a primary call for action, consider listing that as the first suggestion chip.

Whenever possible, you should incorporate one key suggestion as part of the chat bubble, but do so only if the response or chat conversation feels natural.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowSuggestions: ['Exit', 'Continue']
    }
  });


.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowLinkOutSuggestion: {
        name: "Suggestion Link",
        url: 'https://assistant.google.com/',
      }
    }
  });


BasicCard
----------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#basic_card>`_

A basic card displays information that can include the following:

- Image
- Title
- Sub-title
- Text body
- Link button
- Border

Use basic cards mainly for display purposes. They are designed to be concise, to present key (or summary) information to users, and to allow users to learn more if you choose (using a weblink).

In most situations, you should add suggestion chips below the cards to continue or pivot the conversation.

Avoid repeating the information presented in the card in the chat bubble at all costs.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowBasicCard: {
        text: `This is a basic card.  Text in a basic card can include "quotes" and
        most other unicode characters including emoji.  Basic cards also support
        some markdown formatting like *emphasis* or _italics_, **strong** or
        __bold__, and ***bold itallic*** or ___strong emphasis___ `,
        subtitle: 'This is a subtitle',
        title: 'Title: this is a title',
        buttons: new Button({
          title: 'This is a button',
          url: 'https://assistant.google.com/',
        }),
        image: new Image({
          url: 'https://example.com/image.png',
          alt: 'Image alternate text',
        }),
      }
    }
  });


AccountLinkingCard
-------------------

`Actions on Google Documentation <https://developers.google.com/actions/identity/account-linking>`_

Account linking is a great way to lets users connect their Google accounts to existing accounts on your service. This allows you to build richer experiences for your users that take advantage of the data they already have in their account on your service. Whether it’s food preferences, existing payment accounts, music preferences, your users should be able to have better experiences in the Google Assistant by linking their accounts.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowAccountLinkingCard: "To track your exercise"
    }
  });


MediaResponse
---------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/responses#media_responses>`_

Media responses let your app play audio content with a playback duration longer than the 120-second limit of SSML. The primary component of a media response is the single-track card. The card allows the user to perform these operations:

- Replay the last 10 seconds.
- Skip forward for 30 seconds.
- View the total length of the media content.
- View a progress indicator for audio playback.
- View the elapsed playback time.

.. code-block:: javascript

  const { MediaObject } = require('actions-on-google');

  app.onState('someState', () => {

    const mediaObject = new MediaObject({
      name,
      url,
    });

    return {
      dialogflowMediaResponse: mediaObject
    };
  });


User Information
----------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/helpers#user_information>`_

User information
You can obtain the following user information with this helper:

- Display name
- Given name
- Family name
- Coarse device location (zip code and city)
- Precise device location (coordinates and street address)

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowPermission: {
        context: 'To read your mind',
        permissions: 'NAME',
      }
    };
  });


Date and Time
-------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/helpers#date_and_time>`

You can obtain a date and time from users by requesting fulfillment of the actions.intent.DATETIME intent.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowDateTime: {
        prompts: {
          initial: 'When do you want to come in?',
          date: 'Which date works best for you?',
          time: 'What time of day works best for you?',
        }
      }
    };
  });


Confirmation
-------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/helpers#confirmation>`

You can ask a generic confirmation from the user (yes/no question) and get the resulting answer. The grammar for "yes" and "no" naturally expands to things like "Yea" or "Nope", making it usable in many situations.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowConfirmation: 'Can you confirm?',
    };
  });



Android Link
----------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/helpers#android_link>`_

You can ask the user to continue an interaction via your Android app. This helper allows you to prompt the user as part of the conversation. You'll first need to associate your Android app with your Actions Console project via the Brand Verification page.


.. code-block:: javascript

  app.onState('someState', () => {
    const options = {
      destination: 'Google',
      url: 'example://gizmos',
      package: 'com.example.gizmos',
      reason: 'handle this for you',
    };

    return {
      dialogflowDeepLink: options
    };
  });


Place and Location
------------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/helpers#place_and_location>`_

You can obtain a location from users by requesting fulfillment of the actions.intent.PLACE intent. This helper is used to prompt the user for addresses and other locations, including any home/work/contact locations that they've saved with Google.

Saved locations will only return the address, not the associated mapping (e.g. "123 Main St" as opposed to "HOME = 123 Main St").

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowPlace: {
        context: 'To find a place to pick you up',
        prompt: 'Where would you like to be picked up?',
      }
    };
  });



Digital Goods
-------------

`Actions on Google Documentation <https://developers.google.com/actions/transactions/digital/dev-guide-digital>`_

You can add dialog to your Action that sells your in-app products in the Google Play store, using the digital purchases API.

You can use the *google.digitalGoods* object to get the subscriptions and InAppEntitlements filtered by the skuIds you pass to the function. Voxa handles all operations in background to get access to your digital goods in the Play Store. To do that, you need to pass to the GoogleAssistantPlatform object, the packageName of your Android application along with the keyFile with the credentials you created in your Google Cloud project.

.. code-block:: javascript
  const config = {
    transactionOptions: {
      androidAppPackageName: "com.example.com",
      keyFile: "../PATH_TO_YOUR_KEY_FILE",
    },
  };

  const app = new VoxaApp({ views, variables });
  const googleAssistantPlatform = new GoogleAssistantPlatform(app, config);

  app.onIntent("BuyProductIntent", async (voxaEvent) => {
    const inAppEntitlementSkus = await voxaEvent.google.digitalGoods.getInAppEntitlements(["test"]);
    const subscriptionSkus = await voxaEvent.google.digitalGoods.getSubscriptions(["test"]);

    voxaEvent.model.inAppEntitlementsSkus = inAppEntitlementSkus.skus[1];
    voxaEvent.model.subscriptionSkus = subscriptionSkus.skus[0];

    return {
      flow: "yield",
      say: "DigitalGoods.SelectItem.say",
      to: "entry",
    };
  });

  app.onState('someState', () => {
    return {
      googleCompletePurchase: {
        skuId: {
          id: "subscription",
          packageName: "com.example",
          skuType: "SKU_TYPE_SUBSCRIPTION",
        },
      },
    };
  });

  app.onIntent("actions_intent_COMPLETE_PURCHASE", (voxaEvent) => {
    if (voxaEvent.google.digitalGoods.isPurchaseStatusOk()) {
      return {
        reply: "DigitalGoods.Success",
        to: "die",
      };
    }

    if (voxaEvent.google.digitalGoods.isPurchaseStatusAlreadyOwned()) {
      return {
        reply: "DigitalGoods.AlreadyOwned",
        to: "die",
      };
    }

    if (voxaEvent.google.digitalGoods.isPurchaseStatusItemUnavailable()) {
      return {
        reply: "DigitalGoods.ItemUnavailable",
        to: "die",
      };
    }

    if (voxaEvent.google.digitalGoods.isPurchaseStatusChangeRequested()) {
      return {
        reply: "DigitalGoods.ChangeRequested",
        to: "die",
      };
    }

    if (voxaEvent.google.digitalGoods.isPurchaseStatusUserCancelled()) {
      return {
        reply: "DigitalGoods.UserCancelled",
        to: "die",
      };
    }

    if (voxaEvent.google.digitalGoods.isPurchaseStatusError()) {
      return {
        reply: "DigitalGoods.Error",
        to: "die",
      };
    }

    return {
      reply: "DigitalGoods.NotSpecified",
      to: "die",
    };
  });


TransactionDecision
--------------------

TransactionRequirements
-----------------------

Routine Suggestions
--------------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/updates/routines>`_

To consistently re-engage with users, you need to become a part of their daily habits. Google Assistant users can already use Routines to execute multiple Actions with a single command, perfect for those times when users wake up in the morning, head out of the house, get ready for bed or many of the other tasks we perform throughout the day. Now, with Routine Suggestions, after someone engages with your Action, you can prompt them to add your Action to their Routines with just a couple of taps.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowRegisterUpdate: {
        intent: 'Show Image',
        frequency: 'ROUTINES'
      }
    };
  });



Push notifications
---------------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/updates/notifications>`_

Your app can send push notifications to users whenever relevant, such as sending a reminder when the due date for a task is near.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      dialogflowUpdatePermission: {
        intent: 'tell_latest_tip'
      }
    };
  });



Multi-surface conversations
---------------------------

`Actions on Google Documentation <https://developers.google.com/actions/assistant/surface-capabilities#multi-surface_conversations>`_

At any point during your app's flow, you can check if the user has any other surfaces with a specific capability. If another surface with the requested capability is available, you can then transfer the current conversation over to that new surface.


.. code-block:: javascript

  app.onIntent('someState', async (voxaEvent) => {
    const screen = 'actions.capability.SCREEN_OUTPUT';
    if (!_.includes(voxaEvent.supportedInterfaces, screen)) {
      const screenAvailable = voxaEvent.conv.available.surfaces.capabilities.has(screen);

      const context = 'Sure, I have some sample images for you.';
      const notification = 'Sample Images';
      const capabilities = ['actions.capability.SCREEN_OUTPUT'];

      if (screenAvailable) {
        return {
          sayp: 'Hello',
          to: 'entry',
          flow: 'yield',
          dialogflowNewSurface: {
            context, notification, capabilities,
          },
        };
      }

      return {
        sayp: 'Does not have a screen',
        flow: 'terminate',
      };
    }

    return {
      sayp: 'Already has a screen',
      flow: 'terminate',
    };
  });


Output Contexts
------------------

`Actions on Google Documentation <https://actions-on-google.github.io/actions-on-google-nodejs/classes/dialogflow.contextvalues.html#set>`_

If you need to add output contexts to the dialog flow webhook you can use the `dialogflowContext` directive

.. code-block:: javascript

    app.onIntent("LaunchIntent", {
      dialogflowContext: {
        lifespan: 5,
        name: "DONE_YES_NO_CONTEXT",
      },
      sayp: "Hello!",
      to: "entry",
      flow: "yield",
    });
