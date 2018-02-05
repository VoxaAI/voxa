export const views =  {
  "en-US": {
    translation: {
      Card: {
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      },
      Hint: "string",
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
      LaunchIntent: {
        OpenResponse: {
          alexa: "Hello! Good {time}",
          dialogFlow: "Hello from DialogFlow",
        },
      },
      RandomResponse: [
        "Random 1",
        "Random 2",
        "Random 3",
        "Random 4",
      ],
      Question: {
        Ask: {
          ask: "What time is it?",
          reprompt: "What time is it?",
        },

      },
      ExitIntent: {
        Farewell: "Ok. For more info visit {site} site.",
      },
      Number: {
        One: "{numberOne}" ,
      },
      Say: {
        Say: "say" ,
      },
      HelpIntent: {
        HelpAboutSkill: "For more help visit www.rain.agency" ,
      },
      Count: {
        Say:  "{count}",
        Tell: "{count}" ,
      },
      Playing: {
        SayStop: {
          ask: "Say stop if you want to finish the playback",
        },
      },
      BadInput: {
        RepeatLastAskReprompt: {
          say: "I'm sorry. I didn't understand.",
        },
      },
      Reply: {
        Directives: {
          directives: ["{hintDirective}"],
        },
        Tell: {
          tell: "this is a tell",
        },
        Ask: {
          ask: "this is an ask",
          reprompt: "this is a reprompt",
        },
        Combined: {
          ask: "this is an ask",
          directives: ["{hintDirective}"],
          reprompt: "this is a reprompt",
        },
      },
    },
  },
  "de-DE": {
    translation: {
      LaunchIntent: {
        OpenResponse: "Hallo! guten {time}",
      },
      RandomResponse: [
        "zufällig1",
        "zufällig2",
        "zufällig3",
        "zufällig4",
        "zufällig5",
      ],
      Question: {
        Ask:  "wie spät ist es?" ,
      },
      ExitIntent: {
        Farewell: "Ok für weitere Infos besuchen {site} Website" ,
      },
      Number: {
        One:  "{numberOne}" ,
      },
      Say: {
        Say: "sagen" ,
      },
    },
  },
};
