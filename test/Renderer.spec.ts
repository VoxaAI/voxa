import "mocha";

import { expect, use } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import { Model } from "../src/Model";
import { Renderer } from "../src/renderers/Renderer";
import { VoxaApp } from "../src/VoxaApp";
import { variables } from "./variables";
import { views } from "./views";

import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { PlayAudio } from "../src/platforms/alexa/directives";
import { DialogFlowEvent } from "../src/platforms/dialogflow/DialogFlowEvent";
import { AlexaRequestBuilder } from "./tools";

const rb = new AlexaRequestBuilder();

describe("Renderer", () => {
  let statesDefinition: any;
  let event: AlexaEvent;
  let renderer: Renderer;

  before(() => {
    i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    renderer = new Renderer({ views, variables });
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    event.t = i18n.getFixedT("en-US");

    statesDefinition = {
      entry: () => ({ ask: "ExitIntent.Farewell", to: "die" }),
      initState: () => ({ to: "endState" }),
      secondState: () => ({ to: "initState" }),
      thirdState: () => Promise.resolve({ to: "endState" }),
    };
  });

  const locales = {
    "de-DE": {
      number: "ein",
      question: "wie spät ist es?",
      say: "sagen\nwie spät ist es?",
      site: "Ok für weitere Infos besuchen example.com Website",
    },
    "en-US": {
      number: "one",
      question: "What time is it?",
      say: "say\nWhat time is it?",
      site: "Ok. For more info visit example.com site.",
    },
  };

  it("should return an error if the views file doesn't have the local strings", async () => {
    const localeMissing = "en-GB";
    const skill = new VoxaApp({ variables, views });
    skill.onIntent("SomeIntent", () => ({ ask: "Number.One" }));
    event.request.locale = localeMissing;

    const reply = await skill.execute(event, new AlexaReply());
    // expect(reply.error.message).to.equal(`View Number.One for ${localeMissing} locale is missing`);
    expect(reply.speech).to.equal(
      "<speak>An unrecoverable error occurred.</speak>",
    );
  });

  _.forEach(locales, (translations, locale) => {
    describe(locale, () => {
      let skill: VoxaApp;

      beforeEach(() => {
        skill = new VoxaApp({ variables, views });
      });

      it(`should return the correct translation for ${locale}`, async () => {
        _.map(statesDefinition, (state, name: string) =>
          skill.onState(name, state),
        );
        event.request.locale = locale;
        const reply = (await skill.execute(
          event,
          new AlexaReply(),
        )) as AlexaReply;
        expect(reply.speech).to.equal(`<speak>${translations.site}</speak>`);
        expect(reply.response.directives).to.be.undefined;
      });

      it(`work with array responses ${locale}`, async () => {
        skill.onIntent("SomeIntent", () => ({
          ask: "Ask",
          say: "Say",
          to: "entry",
        }));
        event.request.locale = locale;
        const reply = (await skill.execute(
          event,
          new AlexaReply(),
        )) as AlexaReply;
        expect(reply.speech).to.deep.equal(
          `<speak>${translations.say}</speak>`,
        );
        expect(reply.response.directives).to.be.undefined;
      });

      it("should have the locale available in variables", async () => {
        skill.onIntent("SomeIntent", () => ({ tell: "Number.One" }));
        event.request.locale = locale;
        const reply = (await skill.execute(
          event,
          new AlexaReply(),
        )) as AlexaReply;
        expect(reply.speech).to.equal(`<speak>${translations.number}</speak>`);
        expect(reply.response.directives).to.be.undefined;
      });

      it("should return response with directives", async () => {
        const playAudio = new PlayAudio("url", "123", 0);

        skill.onIntent("SomeIntent", () => ({
          ask: "Ask",
          directives: [playAudio],
          to: "entry",
        }));
        event.request.locale = locale;
        const reply = (await skill.execute(
          event,
          new AlexaReply(),
        )) as AlexaReply;
        expect(reply.speech).to.equal(
          `<speak>${translations.question}</speak>`,
        );
        expect(reply.response.directives).to.be.ok;
      });
    });
  });

  it("should render the correct view based on path", async () => {
    const rendered = await renderer.renderPath("Ask", event);
    expect(rendered).to.deep.equal({
      ask: "What time is it?",
      reprompt: "What time is it?",
    });
  });

  it("should use the passed variables and model", async () => {
    event.model = new Model();
    event.model.count = 1;
    const rendered = await renderer.renderMessage({ say: "{count}" }, event);
    expect(rendered).to.deep.equal({ say: "1" });
  });

  it("should fail for missing variables", (done) => {
    renderer
      .renderMessage({ say: "{missing}" }, event)
      .then(() => done("Should have failed"))
      .catch((error) => {
        expect(error.message).to.equal("No such variable in views, missing");
        done();
      });
  });

  it("should throw an exception if path doesn't exists", (done) => {
    renderer.renderPath("Missing.Path", event).then(
      () => done("Should have thrown"),
      (error) => {
        expect(error.message).to.equal(
          "View Missing.Path for en-US locale is missing",
        );
        done();
      },
    );
  });

  it("should use deeply search to render object variable", async () => {
    event.model = new Model();
    event.model.count = 1;
    const rendered = await renderer.renderMessage(
      { card: "{exitCard}", number: 1 },
      event,
    );

    expect(rendered).to.deep.equal({
      card: {
        image: {
          largeImageUrl: "largeImage.jpg",
          smallImageUrl: "smallImage.jpg",
        },
        text: "text",
        title: "title",
        type: "Standard",
      },
      number: 1,
    });
  });

  it("should use deeply search variable and model in complex object structure", async () => {
    event.model = new Model();
    event.model.count = 1;
    const rendered = await renderer.renderMessage(
      {
        card: { title: "{count}", text: "{count}", array: [{ a: "{count}" }] },
      },
      event,
    );

    expect(rendered).to.deep.equal({
      card: {
        array: [{ a: "1" }],
        text: "1",
        title: "1",
      },
    });
  });

  it("should use deeply search to render array variable", async () => {
    const reply = await renderer.renderMessage({ card: "{exitArray}" }, event);
    expect(reply).to.deep.equal({ card: [{ a: 1 }, { b: 2 }, { c: 3 }] });
  });

  it("should use the dialogFlow view if available", async () => {
    const dialogFlowEvent = new DialogFlowEvent(
      require("./requests/dialogflow/launchIntent.json"),
      {},
    );
    dialogFlowEvent.t = event.t;
    const rendered = await renderer.renderPath(
      "LaunchIntent.OpenResponse",
      dialogFlowEvent,
    );
    expect(rendered).to.equal("Hello from DialogFlow");
  });
});
