.. _dialogflow-platforms:

================================
Dialogflow Platform Integrations
================================
Dialogflow offers a variety of integrations so you share your base code across several platforms like Google Assistant, Facebook Messenger and more. For more information about these platforms, visit their `Integration docs <https://dialogflow.com/docs/integrations>`_.

More integrations comming soon to Voxa


.. _facebook:

Facebook Messenger
==================

The ``DialogflowPlatform`` for voxa has available some of the core functionalities to send to your chatbot in responses. When you initialize the Facebook Platform object, you can optionally pass a configuration object with the Facebook Page Access Token:

.. code-block:: javascript

  const { FacebookPlatform } = require('voxa');

  const config = {
    pageAccessToken: 'EAAaKuJF183EBAApxv.........',
  };
  const app = new VoxaApp({ views, variables });
  const facebookBot = new FacebookPlatform(app, config);


Voxa will use this token to perform some authentication operations like sending actions to the user's chat window. Check the `Facebook Event <dialogflow-events.html#the-facebookevent-object>`_ object for more details.

Voxa also offers a variety of built-in rich components for you to send along with your response. For now, you can integrate the following:

- Account Linking button
You need to include in your controller the following field: ``facebookAccountLink``, which takes a URL to go into the account linking flow. For more information about the account linking flow, check how to add a `Log In Button <https://developers.facebook.com/docs/messenger-platform/send-messages/buttons#login>`_, and `Account Linking <https://developers.facebook.com/docs/messenger-platform/identity/account-linking>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookAccountLink: "https://www.messenger.com",
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookAccountLink"
    };
  });
  .....
  views
  .....
  {
    "FacebookAccountLink": {
      "facebookAccountLink": "https://www.messenger.com"
    }
  }

- Account Unlink button
You need to include in your controller the following field: ``facebookAccountUnlink``, which can take any value like a boolean, just to indicate to Voxa we're adding this button to the response. For more information about the account linking flow, check how to add a `Log Out Button <https://developers.facebook.com/docs/messenger-platform/send-messages/buttons#logout>`_, and `Account Linking <https://developers.facebook.com/docs/messenger-platform/identity/account-linking>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookAccountUnlink: true,
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookAccountUnlink"
    };
  });
  .....
  views
  .....
  {
    "FacebookAccountLink": {
      "facebookAccountUnlink": true
    }
  }


- Location Quick Reply
You need to include in your controller the following field: ``facebookQuickReplyLocation``, which takes a string with the title of the message that goes along with the button requesting user's location. For more information about the account linking flow, check how to add a `Location Quick Reply <https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies#locations>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookQuickReplyLocation: "Send me your location",
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookQuickReplyLocation"
    };
  });
  .....
  views
  .....
  {
    "FacebookQuickReplyLocation": {
      "facebookQuickReplyLocation": "Send me your location"
    }
  }


- Phone Number Quick Reply
You need to include in your controller the following field: ``facebookQuickReplyPhoneNumber``, which takes a string with the title of the message that goes along with the button requesting user's phone number. For more information about the account linking flow, check how to add a `User Phone Number Quick Reply <https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies#phone>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookQuickReplyPhoneNumber: "Send me your phone number",
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookQuickReplyPhoneNumber"
    };
  });
  .....
  views
  .....
  {
    "FacebookQuickReplyPhoneNumber": {
      "facebookQuickReplyPhoneNumber": "Send me your phone number"
    }
  }


- Text Quick Reply
You need to include in your controller the following field: ``directives``, which takes an array of directives, and the one you're going to send is a FacebookQuickReplyText directive, that takes 2 parameters:
- message: string with the title of the message that goes along with the button requesting user's email.
- replyArray: a IFacebookQuickReply object or array of objets with the options to render in the chat.

For more information about the account linking flow, check how to add a `User Text Quick Reply <https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies#text>`_.

.. code-block:: javascript

  const { FacebookQuickReplyText, IFacebookQuickReply } = require('voxa');

  app.onState('someState', () => {
    const quickReplyTextArray: IFacebookQuickReply[] = [
      {
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/16777216colors.png/220px-16777216colors.png",
        payload: "square",
        title: "Square Multicolor",
      },
      {
        imageUrl: "https://www.w3schools.com/colors/img_colormap.gif",
        payload: "hexagonal",
        title: "Hexagonal multicolor",
      },
    ];

    const facebookQuickReplyText = new FacebookQuickReplyText("What's your favorite shape?", quickReplyTextArray);

    return {
      directives: [facebookQuickReplyText],
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookQuickReplyText"
    };
  });
  .....
  views
  .....
  {
    "FacebookQuickReplyText": {
      "facebookQuickReplyText": "{quickReplyText}"
    }
  }
  .........
  variables
  .........
  const { FacebookQuickReplyText } = require('voxa');

  export function quickReplyText(request) {
    const quickReplyTextArray = [
      {
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/16777216colors.png/220px-16777216colors.png",
        payload: "square",
        title: "Square Multicolor",
      },
      {
        imageUrl: "https://www.w3schools.com/colors/img_colormap.gif",
        payload: "hexagonal",
        title: "Hexagonal multicolor",
      },
    ];

    const facebookQuickReplyText = new FacebookQuickReplyText("What's your favorite shape?", quickReplyTextArray);

    return {
      directives: [facebookQuickReplyText],
    };
  },


- Email Quick Reply
You need to include in your controller the following field: ``facebookQuickReplyUserEmail``, which takes a string with the title of the message that goes along with the button requesting user's email. For more information about the account linking flow, check how to add a `User Email Quick Reply <https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies#email>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookQuickReplyUserEmail: "Send me your email",
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookQuickReplyUserEmail"
    };
  });
  .....
  views
  .....
  {
    "FacebookQuickReplyUserEmail": {
      "facebookQuickReplyUserEmail": "Send me your email"
    }
  }


- Postbacks buttons (Suggestion chips)
You need to include in your controller the following field: ``facebookSuggestionChips``, which could be a simple string that the Voxa renderer will get from your views file with an array of strings, or directly an array of strings. For more information about this, check how to add `Postback Buttons <https://developers.facebook.com/docs/messenger-platform/send-messages/buttons#postback>`_.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookSuggestionChips: ["YES", "NO"],
      textp: "Select YES or NO",
      to: "entry",
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookSuggestionChips"
    };
  });
  .....
  views
  .....
  {
    "FacebookSuggestionChips": {
      "facebookSuggestionChips": ["YES", "NO"]
    }
  }


- Carousel
You need to include in your controller the following field: ``facebookCarousel``, which takes an object with an array of elements to be taken as items in a generic list of buttons. For more information about the carousel, check how to add a `Generic Template <https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic>`_.

.. code-block:: javascript
  const {
    FACEBOOK_BUTTONS,
    FACEBOOK_WEBVIEW_HEIGHT_RATIO,
    FacebookButtonTemplateBuilder,
    FacebookElementTemplateBuilder,
    FacebookTemplateBuilder,
  } = require('voxa');

  app.onState('someState', () => {
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const elementBuilder1 = new FacebookElementTemplateBuilder();
    const elementBuilder2 = new FacebookElementTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setTitle("Go to see this URL")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("https://www.example.com/imgs/imageExample.png");

    buttonBuilder2
      .setPayload("value")
      .setTitle("Send this to chat")
      .setType(FACEBOOK_BUTTONS.POSTBACK);

    elementBuilder1
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .setDefaultActionUrl("https://www.example.com/imgs/imageExample.png")
      .setDefaultMessengerExtensions(false)
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.COMPACT)
      .setImageUrl("https://www.w3schools.com/colors/img_colormap.gif")
      .setSubtitle("subtitle")
      .setTitle("title");

    elementBuilder2
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .setDefaultActionUrl("https://www.example.com/imgs/imageExample.png")
      .setDefaultMessengerExtensions(false)
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
      .setImageUrl("https://www.w3schools.com/colors/img_colormap.gif")
      .setSubtitle("subtitle")
      .setTitle("title");

    facebookTemplateBuilder
      .addElement(elementBuilder1.build())
      .addElement(elementBuilder2.build());

    return {
      facebookCarousel: facebookTemplateBuilder.build(),
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookCarousel"
    };
  });
  .....
  views
  .....
  {
    "FacebookCarousel": {
      "facebookCarousel": "{carousel}"
    }
  }
  .........
  variables
  .........
  carousel: function carousel(request) {
    const buttons = [
      {
        title: "Go to see this URL",
        type: FACEBOOK_BUTTONS.WEB_URL,
        url: "https://www.example.com/imgs/imageExample.png",
      },
      {
        payload: "value",
        title: "Send this to chat",
        type: FACEBOOK_BUTTONS.POSTBACK,
      },
    ];

    const carousel = {
      elements: [
        {
          buttons,
          defaultActionUrl: "https://www.example.com/imgs/imageExample.png",
          defaultMessengerExtensions: false,
          defaultWebviewHeightRatio: FACEBOOK_WEBVIEW_HEIGHT_RATIO.COMPACT,
          imageUrl: "https://www.w3schools.com/colors/img_colormap.gif",
          subtitle: "subtitle",
          title: "title",
        },
        {
          buttons,
          defaultActionUrl: "https://www.example.com/imgs/imageExample.png",
          defaultMessengerExtensions: false,
          defaultWebviewHeightRatio: FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL,
          imageUrl: "https://www.w3schools.com/colors/img_colormap.gif",
          subtitle: "subtitle",
          title: "title",
        },
      ],
    };

    return carousel;
  },


- List
You need to include in your controller the following field: ``facebookList``, which takes an object with an array of elements to be taken as items in a list of buttons. For more information about the carousel, check how to add a `List Template <https://developers.facebook.com/docs/messenger-platform/send-messages/template/list>`_.

.. code-block:: javascript
  const {
    FACEBOOK_BUTTONS,
    FACEBOOK_WEBVIEW_HEIGHT_RATIO,
    FACEBOOK_TOP_ELEMENT_STYLE,
    FacebookButtonTemplateBuilder,
    FacebookElementTemplateBuilder,
    FacebookTemplateBuilder,
  } = require('voxa');

  app.onState('someState', () => {
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const elementBuilder1 = new FacebookElementTemplateBuilder();
    const elementBuilder2 = new FacebookElementTemplateBuilder();
    const elementBuilder3 = new FacebookElementTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setPayload("payload")
      .setTitle("View More")
      .setType(FACEBOOK_BUTTONS.POSTBACK);

    buttonBuilder2
      .setTitle("View")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.FULL);

    elementBuilder1
      .addButton(buttonBuilder2.build())
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("See all our colors")
      .setTitle("Classic T-Shirt Collection");

    elementBuilder2
      .setDefaultActionUrl("https://www.w3schools.com")
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("See all our colors")
      .setTitle("Classic T-Shirt Collection");

    elementBuilder3
      .addButton(buttonBuilder2.build())
      .setDefaultActionUrl("https://www.w3schools.com")
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("100% Cotton, 200% Comfortable")
      .setTitle("Classic T-Shirt Collection");

    facebookTemplateBuilder
      .addButton(buttonBuilder1.build())
      .addElement(elementBuilder1.build())
      .addElement(elementBuilder2.build())
      .addElement(elementBuilder3.build())
      .setSharable(true)
      .setTopElementStyle(FACEBOOK_TOP_ELEMENT_STYLE.LARGE);

    return {
      facebookList: facebookTemplateBuilder.build(),
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookList"
    };
  });
  .....
  views
  .....
  {
    "FacebookList": {
      "facebookList": "{list}"
    }
  }
  .........
  variables
  .........
  list: function list(request) {
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const elementBuilder1 = new FacebookElementTemplateBuilder();
    const elementBuilder2 = new FacebookElementTemplateBuilder();
    const elementBuilder3 = new FacebookElementTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setPayload("payload")
      .setTitle("View More")
      .setType(FACEBOOK_BUTTONS.POSTBACK);

    buttonBuilder2
      .setTitle("View")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.FULL);

    elementBuilder1
      .addButton(buttonBuilder2.build())
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("See all our colors")
      .setTitle("Classic T-Shirt Collection");

    elementBuilder2
      .setDefaultActionUrl("https://www.w3schools.com")
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("See all our colors")
      .setTitle("Classic T-Shirt Collection");

    elementBuilder3
      .addButton(buttonBuilder2.build())
      .setDefaultActionUrl("https://www.w3schools.com")
      .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
      .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
      .setSubtitle("100% Cotton, 200% Comfortable")
      .setTitle("Classic T-Shirt Collection");

    facebookTemplateBuilder
      .addButton(buttonBuilder1.build())
      .addElement(elementBuilder1.build())
      .addElement(elementBuilder2.build())
      .addElement(elementBuilder3.build())
      .setSharable(true)
      .setTopElementStyle(FACEBOOK_TOP_ELEMENT_STYLE.LARGE);

    return facebookTemplateBuilder.build();
  },


- Button Template
You need to include in your controller the following field: ``facebookButtonTemplate``, which takes an object with an array of buttons to be taken as items in a list of buttons. For more information about the button template, check how to add a `Button Template <https://developers.facebook.com/docs/messenger-platform/send-messages/template/button>`_.

.. code-block:: javascript
  const {
    FACEBOOK_BUTTONS,
    FacebookButtonTemplateBuilder,
    FacebookTemplateBuilder,
  } = require('voxa');

  app.onState('someState', () => {
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const buttonBuilder3 = new FacebookButtonTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setPayload("payload")
      .setTitle("View More")
      .setType(FACEBOOK_BUTTONS.POSTBACK);

    buttonBuilder2
      .setPayload("1234567890")
      .setTitle("Call John")
      .setType(FACEBOOK_BUTTONS.PHONE_NUMBER);

    buttonBuilder3
      .setTitle("Go to Twitter")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("http://www.twitter.com");

    facebookTemplateBuilder
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .addButton(buttonBuilder3.build())
      .setText("What do you want to do?");

    return {
      facebookButtonTemplate: facebookTemplateBuilder.build(),
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookButtonTemplate"
    };
  });
  .....
  views
  .....
  {
    "FacebookButtonTemplate": {
      "facebookButtonTemplate": "{buttonTemplate}"
    }
  }
  .........
  variables
  .........
  buttonTemplate: function buttonTemplate(request) {
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const buttonBuilder3 = new FacebookButtonTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setPayload("payload")
      .setTitle("View More")
      .setType(FACEBOOK_BUTTONS.POSTBACK);

    buttonBuilder2
      .setPayload("1234567890")
      .setTitle("Call John")
      .setType(FACEBOOK_BUTTONS.PHONE_NUMBER);

    buttonBuilder3
      .setTitle("Go to Twitter")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("http://www.twitter.com");

    facebookTemplateBuilder
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .addButton(buttonBuilder3.build())
      .setText("What do you want to do?");

    return facebookTemplateBuilder.build();
  },


- Open Graph Template
You need to include in your controller the following field: ``facebookOpenGraphTemplate``, which takes an object with an array of buttons to be taken as items in a list of buttons and a url for the open graph link. For more information about the button template, check how to add a `Open Graph Template <https://developers.facebook.com/docs/messenger-platform/send-messages/template/open-graph>`_.

.. code-block:: javascript
  const {
    FACEBOOK_BUTTONS,
    FacebookButtonTemplateBuilder,
    FacebookTemplateBuilder,
  } = require('voxa');

  app.onState('someState', () => {
    const elementBuilder1 = new FacebookElementTemplateBuilder();
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setTitle("Go to Wikipedia")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("https://en.wikipedia.org/wiki/Rickrolling");

    buttonBuilder2
      .setTitle("Go to Twitter")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("http://www.twitter.com");

    elementBuilder1
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .setUrl("https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb");

    facebookTemplateBuilder
      .addElement(elementBuilder1.build());

    return {
      facebookOpenGraphTemplate: facebookTemplateBuilder.build(),
    };
  });

Or you can also handle these values from your views file

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      reply: "FacebookOpenGraphTemplate"
    };
  });
  .....
  views
  .....
  {
    "FacebookOpenGraphTemplate": {
      "facebookOpenGraphTemplate": "{openGraphTemplate}"
    }
  }
  .........
  variables
  .........
  openGraphTemplate: function openGraphTemplate(request) {
    const elementBuilder1 = new FacebookElementTemplateBuilder();
    const buttonBuilder1 = new FacebookButtonTemplateBuilder();
    const buttonBuilder2 = new FacebookButtonTemplateBuilder();
    const facebookTemplateBuilder = new FacebookTemplateBuilder();

    buttonBuilder1
      .setTitle("Go to Wikipedia")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("https://en.wikipedia.org/wiki/Rickrolling");

    buttonBuilder2
      .setTitle("Go to Twitter")
      .setType(FACEBOOK_BUTTONS.WEB_URL)
      .setUrl("http://www.twitter.com");

    elementBuilder1
      .addButton(buttonBuilder1.build())
      .addButton(buttonBuilder2.build())
      .setUrl("https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb");

    facebookTemplateBuilder
      .addElement(elementBuilder1.build());

    return facebookTemplateBuilder.build();
  },



For more information check the `Dialogflow documentation for Facebook Messenger <https://dialogflow.com/docs/integrations/facebook>`_



.. _telegram:

Telegram
=========

The ``DialogflowPlatform`` for voxa can be easily integrated with telegram, just make sure to use
``text`` responses in your controllers and everything should work as usual.

For more information check the `Dialogflow documentation for telegram <https://dialogflow.com/docs/integrations/telegram>`_
