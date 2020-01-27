/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export const views = {
  "de-DE": {
    translation: {
      APLKaraokeCommand: {
        commands: [
          {
            align: "center",
            componentId: "textComponent",
            highlightMode: "line",
            type: "SpeakItem",
          },
        ],
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.ExecuteCommands",
      },
      APLTCommand: {
        commands: [
          {
            componentId: "myTextId",
            delay: 3000,
            description:
              "Changes the text property value on the 'myTextId' component.",
            property: "text",
            type: "SetValue",
            value: "New text value!",
          },
        ],
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APLT.ExecuteCommands",
      },
      APLTTemplate: {
        datasources: {},
        document: {},
        targetProfile: "FOUR_CHARACTER_CLOCK",
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APLT.RenderDocument",
      },
      APLTemplate: {
        datasources: {},
        document: {},
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.RenderDocument",
      },
      Ask: "wie spät ist es?",
      ExitIntent: {
        Farewell: "Ok für weitere Infos besuchen {site} Website",
      },
      GermanOnly: "Dieses view ist nur in Deutsch verfügbar",
      LaunchIntent: {
        OpenResponse: "Hallo! guten {time}",
      },
      Number: {
        One: "{numberOne}",
      },
      RandomResponse: [
        "zufällig1",
        "zufällig2",
        "zufällig3",
        "zufällig4",
        "zufällig5",
      ],
      Say: "sagen",
    },
  },
  "en-US": {
    translation: {
      APLKaraokeCommand: {
        commands: [
          {
            align: "center",
            componentId: "textComponent",
            highlightMode: "line",
            type: "SpeakItem",
          },
        ],
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.ExecuteCommands",
      },
      APLTCommand: {
        commands: [
          {
            componentId: "myTextId",
            delay: 3000,
            description:
              "Changes the text property value on the 'myTextId' component.",
            property: "text",
            type: "SetValue",
            value: "New text value!",
          },
        ],
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APLT.ExecuteCommands",
      },
      APLTTemplate: {
        datasources: {},
        document: {},
        targetProfile: "FOUR_CHARACTER_CLOCK",
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APLT.RenderDocument",
      },
      APLTemplate: {
        datasources: {},
        document: {},
        token: "SkillTemplateToken",
        type: "Alexa.Presentation.APL.RenderDocument",
      },
      AccountLinking: "Please Log in",
      Ask: {
        ask: "What time is it?",
        reprompt: "What time is it?",
      },
      AskRandom: ["ask1", "ask2", "ask3"],
      AskRandomObj: {
        ask: ["ask1", "ask2", "ask3"],
        reprompt: ["reprompt1", "reprompt2", "reprompt3"],
      },
      BadInput: {
        RepeatLastAskReprompt: {
          say: "I'm sorry. I didn't understand.",
        },
      },
      BotFrameworkAudioCard: {
        content: {
          media: [
            {
              profile: "",
              url: "http://example.com",
            },
          ],
        },
        contentType: "application/vnd.microsoft.card.audio",
      },
      Buttons: {
        Bye: "Thanks for playing with echo buttons.",
        Discover: "Press 2 or up to 4 buttons to wake them up.",
        Next: "Guess the next pattern.",
      },
      Card: {
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      },
      Card2: "{card2}",
      Confirmation: "Is that true?",
      Count: {
        Say: "{count}",
        Tell: "{count}",
      },
      CustomerContact: {
        FullInfo:
          "Welcome {customerContactGivenName}, your email address is {customerContactEmail}, and your phone number is {customerContactCountry} {customerContactNumber}",
        PermissionNotGranted:
          "To get the user's info, go to your Alexa app and grant permission to the skill.",
      },
      DeviceAddress: {
        FullAddress: "Right now your device is in: {deviceInfo}",
        PermissionNotGranted:
          "To get the device's address, go to your Alexa app and grant permission to the skill.",
        PostalCode: "Your postal code is: {deviceInfo}",
      },
      DeviceSettings: {
        Error: "There was an error trying to get your settings info.",
        FullSettings: "Your default settings are: {settingsInfo}",
      },
      DialogflowBasicCard: {
        buttons: {
          openUrlAction: "https://example.com",
          title: "Example.com",
        },
        display: "DEFAULT",
        image: {
          url: "https://example.com/image.png",
        },
        subtitle: "subtitle",
        text: "This is the text",
        title: "title",
      },
      DialogflowCarousel: {
        items: {
          LIST_ITEM: {
            description: "The item description",
            title: "the list item",
          },
        },
      },
      DialogflowListSelect: {
        items: [
          {
            description: "The item description",
            image: {
              accessibilityText: "The image",
              url: "http://example.com/image.jpg",
            },
            title: "The list item",
          },
        ],
        title: "The list select",
      },
      DialogflowSuggestions: {
        dialogflowSuggestions: ["Suggestion 1", "Suggestion 2"],
      },
      DigitalGoods: {
        BuyItem: {
          googleCompletePurchase: {
            developerPayload: "developerPayload",
            skuId: {
              id: "subscription",
              packageName: "com.example",
              skuType: "SKU_TYPE_SUBSCRIPTION",
            },
          },
          say: "Would you like to buy it?",
        },
        SelectItem: {
          say: "What item would you like to buy?",
        },
      },
      Error: "There was some error, please try again later",
      ExitIntent: {
        Farewell: "Ok. For more info visit {site} site.",
      },
      Facebook: {
        AccountLink: {
          facebookAccountLink: "https://www.messenger.com",
          say: "Say!",
          text: "Text!",
        },
        AccountUnlink: {
          facebookAccountUnlink: true,
          say: "Say!",
          text: "Text!",
        },
        ButtonTemplate: {
          facebookButtonTemplate: "{facebookButtonTemplate}",
          say: "Say!",
          text: "Text!",
        },
        Carousel: {
          facebookCarousel: "{facebookCarousel}",
          say: "Say!",
          text: "Text!",
        },
        ControlPassed: {
          text: "Ok. An agent will talk to you soon!",
        },
        ControlRequested: {
          text: "Ok. Now I'm talking to you!",
        },
        ControlTaken: {
          text: "Ok. Now I'm taking the control!",
        },
        List: {
          facebookList: "{facebookList}",
          say: "Say!",
          text: "Text!",
        },
        OpenGraphTemplate: {
          facebookOpenGraphTemplate: "{facebookOpenGraphTemplate}",
          say: "Say!",
          text: "Text!",
        },
        QuickReplyLocation: {
          facebookQuickReplyLocation: "Send me your location",
          say: "Say!",
          text: "Text!",
        },
        QuickReplyPhoneNumber: {
          facebookQuickReplyPhoneNumber: "Send me your phone number",
          say: "Say!",
          text: "Text!",
        },
        QuickReplyUserEmail: {
          facebookQuickReplyUserEmail: "Send me your email",
          say: "Say!",
          text: "Text!",
        },
        Suggestions: {
          facebookSuggestionChips: ["Suggestion 1", "Suggestion 2"],
          text: "Pick a suggestion",
        },
        User: {
          FullInfo: "Nice to meet you {name}!",
          PermissionNotGranted:
            "To get the user's info, go to your Alexa app and grant permission to the skill.",
        },
      },
      Help: "This is the help",
      HelpIntent: {
        HelpAboutSkill: "For more help visit www.rain.agency",
      },
      Hint: "string",
      ISP: {
        Invalid: {
          ask:
            "To do In Skill Purchases, you need to link your Amazon account to the US market.",
          reprompt: "Can you try again?",
        },
        ProductBought: {
          ask: "Thanks for buying this product, do you want to try it out?",
          reprompt: "Do you want to try it out?",
        },
        ProductNotBought: "Thanks for your interest",
      },
      LaunchIntent: {
        OpenResponse: {
          alexa: "Hello! Good {time}",
          dialogflow: "Hello from Dialogflow",
          facebook: "Hello from Facebook",
          google: "Hello from Google Assistant",
        },
      },
      Lists: {
        ListDeleted: "List has been successfully deleted",
        ProductCreated: "Product has been successfully created",
        ProductModified: "Product has been successfully modified",
        WithItems: "Lists with items are: {listsWithItems}",
      },
      MultipleSessionEntities: [
        {
          entities: [
            {
              synonyms: ["apple", "green apple", "crabapple"],
              value: "APPLE_KEY",
            },
            {
              synonyms: ["orange"],
              value: "ORANGE_KEY",
            },
          ],
          entityOverrideMode: "ENTITY_OVERRIDE_MODE_OVERRIDE",
          name: "fruit",
        },
        {
          entities: [
            {
              synonyms: ["lion", "cat", "wild cat", "simba"],
              value: "LION_KEY",
            },
            {
              synonyms: ["elephant", "mammoth"],
              value: "ELEPHANT_KEY",
            },
          ],
          entityOverrideMode: "ENTITY_OVERRIDE_MODE_OVERRIDE",
          name: "animal",
        },
      ],
      MyDynamicEntity: [
        {
          name: "LIST_OF_AVAILABLE_NAMES",
          values: [
            {
              id: "nathan",
              name: {
                synonyms: ["nate"],
                value: "nathan",
              },
            },
          ],
        },
      ],
      MySessionEntity: [
        {
          entities: [
            {
              synonyms: ["apple", "green apple", "crabapple"],
              value: "APPLE_KEY",
            },
            {
              synonyms: ["orange"],
              value: "ORANGE_KEY",
            },
          ],
          entityOverrideMode: "ENTITY_OVERRIDE_MODE_OVERRIDE",
          name: "fruit",
        },
      ],
      Number: {
        One: "{numberOne}",
      },
      Playing: {
        SayStop: {
          ask: "Say stop if you want to finish the playback",
        },
      },
      RandomResponse: ["Random 1", "Random 2", "Random 3", "Random 4"],
      Reminder: {
        Created: "Reminder created with ID: {reminderId}",
        Deleted: "Reminder deleted",
        Get: "Reminder content: {reminderContent}",
        GetAllReminders: "Reminder content: {reminderAllContent}",
        Updated: "Reminder updated with ID: {reminderId}",
      },
      RenderTemplate: {
        template: {
          backButton: "VISIBLE",
          backgroundImage: "Image",
          textContent: {
            primaryText: {
              text: "string",
              type: "string",
            },
            secondaryText: {
              text: "string",
              type: "string",
            },
            tertiaryText: {
              text: "string",
              type: "string",
            },
          },
          title: "string",
          token: "string",
          type: "BodyTemplate1",
        },
        type: "Display.RenderTemplate",
      },
      Reply: {
        Card: {
          alexaCard: {
            image: {
              largeImageUrl: "https://example.com/large.jpg",
              smallImageUrl: "https://example.com/small.jpg",
            },
            title: "Title",
            type: "Standard",
          },
          alexaHint: "this is the hint",
        },
        DialogflowBasicCard: {
          dialogflowBasicCard: {
            buttons: {
              openUrlAction: "https://example.com",
              title: "Example.com",
            },
            display: "DEFAULT",
            image: {
              url: "https://example.com/image.png",
            },
            subtitle: "subtitle",
            text: "This is the text",
            title: "title",
          },
        },
        Say: {
          reprompt: "this is a reprompt",
          say: "this is a say",
        },
        Say2: {
          say: "this is another say",
        },
        VideoAppLaunch: {
          alexaVideoAppLaunch: {
            source: "https://example.com/video.mp4",
            subtitle: "Video Subtitle",
            title: "Video Title",
          },
        },
      },
      Reprompt: "reprompt",
      RepromptRandom: ["reprompt1", "reprompt2", "reprompt3"],
      Say: "say",
      SayRandom: ["say1", "say2", "say3"],
      Tell: "tell",
      TellRandom: ["tell1", "tell2", "tell3"],
      XML: {
        ampersand: "Some & Some",
        invalidTag: "<audio />Test</audio>",
      },
    },
  },
};
