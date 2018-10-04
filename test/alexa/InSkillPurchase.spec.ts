import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";

import { AlexaPlatform } from "../../src/platforms/alexa/AlexaPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { AlexaRequestBuilder, isAlexaEvent } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const rb = new AlexaRequestBuilder();

const ispMock = {
  inSkillProducts: [
    {
      productId: "1",
      referenceName: "sword",
    },
    {
      productId: "2",
      referenceName: "shield",
    },
  ],
};

describe("InSkillPurchase", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  before(() => {
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);

    const reqheaders = {
      "accept": "application/json",
      "accept-language": "en-US",
      "authorization": "Bearer apiAccessToken",
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    nock("https://api.amazonalexa.com", { reqheaders })
      .persist()
      .get("/v1/users/~current/skills/~current/inSkillProducts")
      .reply(200, JSON.stringify(ispMock));
  });

  after(() => {
    nock.cleanAll();
  });

  it("should send a buy request", async () => {
    event = rb.getIntentRequest("BuyIntent", { productName: "sword" });
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent("BuyIntent", async (voxaEvent) => {
      const { productName } = _.get(voxaEvent, "intent.params");
      const token = "startState";
      let buyDirective;

      if (isAlexaEvent(voxaEvent)) {
        buyDirective = await voxaEvent.alexa.isp.buyByReferenceName(
          productName,
          token,
        );
      }

      return { alexaConnectionsSendRequest: buyDirective };
    });

    const reply = await alexaSkill.execute(event);

    const responseDirectives = _.get(reply, "response.directives")[0];

    expect(reply.response.outputSpeech).to.be.undefined;
    expect(reply.response.reprompt).to.be.undefined;
    expect(responseDirectives.type).to.equal("Connections.SendRequest");
    expect(responseDirectives.name).to.equal("Buy");
    expect(responseDirectives.payload.InSkillProduct.productId).to.equal("1");
    expect(responseDirectives.token).to.equal("startState");
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should send a cancel request", async () => {
    event = rb.getIntentRequest("RefundIntent", { productName: "sword" });
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent("RefundIntent", async (voxaEvent) => {
      const { productName } = _.get(voxaEvent, "intent.params");
      const token = "startState";
      let buyDirective;

      if (isAlexaEvent(voxaEvent)) {
        buyDirective = await voxaEvent.alexa.isp.cancelByReferenceName(
          productName,
          token,
        );
      }

      return { alexaConnectionsSendRequest: buyDirective };
    });

    const reply = await alexaSkill.execute(event);

    const responseDirectives = _.get(reply, "response.directives")[0];

    expect(reply.response.outputSpeech).to.be.undefined;
    expect(reply.response.reprompt).to.be.undefined;
    expect(responseDirectives.type).to.equal("Connections.SendRequest");
    expect(responseDirectives.name).to.equal("Cancel");
    expect(responseDirectives.payload.InSkillProduct.productId).to.equal("1");
    expect(responseDirectives.token).to.equal("startState");
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should send an upsell request", async () => {
    event = rb.getIntentRequest("BuyIntent", { productName: "shield" });
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    const upsellMessage = "Please buy it";
    alexaSkill.onIntent("BuyIntent", async (voxaEvent) => {
      const { productName } = _.get(voxaEvent, "intent.params");
      const token = "startState";
      let buyDirective;

      if (isAlexaEvent(voxaEvent)) {
        buyDirective = await voxaEvent.alexa.isp.upsellByReferenceName(
          productName,
          upsellMessage,
          token,
        );
      }

      return { alexaConnectionsSendRequest: buyDirective };
    });

    const reply = await alexaSkill.execute(event);

    const responseDirectives = _.get(reply, "response.directives")[0];

    expect(reply.response.outputSpeech).to.be.undefined;
    expect(reply.response.reprompt).to.be.undefined;
    expect(responseDirectives.type).to.equal("Connections.SendRequest");
    expect(responseDirectives.name).to.equal("Upsell");
    expect(responseDirectives.payload.InSkillProduct.productId).to.equal("2");
    expect(responseDirectives.payload.upsellMessage).to.equal(upsellMessage);
    expect(responseDirectives.token).to.equal("startState");
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should not send ISP directives on invalid endpoint", async () => {
    event = rb.getIntentRequest("BuyIntent", { productName: "shield" });
    _.set(
      event,
      "context.System.apiEndpoint",
      "https://api.fe.amazonalexa.com",
    );

    alexaSkill.onIntent("BuyIntent", (voxaEvent) => {
      if (isAlexaEvent(voxaEvent) && !voxaEvent.alexa.isp.isAllowed()) {
        return { ask: "ISP.Invalid", to: "entry" };
      }

      return { to: "entry" };
    });

    const reply = await alexaSkill.execute(event);
    const outputSpeech =
      "To do In Skill Purchases, you need to link your Amazon account to the US market.";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(_.get(reply, "response.reprompt.outputSpeech.ssml")).to.include(
      "Can you try again?",
    );
    expect(_.get(reply, "response.directives")).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("entry");
    expect(reply.response.shouldEndSession).to.equal(false);
  });

  it("should handle ACCEPTED purchase result", async () => {
    const status: any = {
      code: "200",
      message: "OK",
    };

    const payload: any = {
      message: "optional additional message",
      productId: "string",
      purchaseResult: "ACCEPTED",
    };

    event = rb.getConnectionsResponseRequest(
      "Buy",
      "firstState",
      payload,
      status,
    );

    app.onSessionStarted((voxaEvent: any) => {
      voxaEvent.model.flag = 1;
    });

    alexaSkill.onState("firstState", () => ({}));
    alexaSkill.onIntent("Connections.Response", (voxaEvent) => {
      if (voxaEvent.rawEvent.request.payload.purchaseResult === "ACCEPTED") {
        const to = voxaEvent.rawEvent.request.token;

        return { ask: "ISP.ProductBought", to };
      }

      return { tell: "ISP.ProductNotBought" };
    });

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Thanks for buying this product, do you want to try it out?",
    );
    expect(_.get(reply, "response.reprompt.outputSpeech.ssml")).to.include(
      "Do you want to try it out?",
    );
    expect(_.get(reply, "sessionAttributes.model.flag")).to.equal(1);
    expect(_.get(reply, "sessionAttributes.state")).to.equal("firstState");
    expect(reply.response.shouldEndSession).to.equal(false);
  });

  it("should handle DECLINED purchase result", async () => {
    const status: any = {
      code: "200",
      message: "OK",
    };

    const payload: any = {
      message: "optional additional message",
      productId: "string",
      purchaseResult: "DECLINED",
    };

    event = rb.getConnectionsResponseRequest(
      "Buy",
      "firstState",
      payload,
      status,
    );

    app.onSessionStarted((voxaEvent: any) => {
      voxaEvent.model.flag = 1;
    });

    alexaSkill.onIntent("Connections.Response", (voxaEvent) => {
      if (voxaEvent.rawEvent.request.payload.purchaseResult === "ACCEPTED") {
        return { ask: "ISP.ProductBought" };
      }

      return { tell: "ISP.ProductNotBought" };
    });

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Thanks for your interest",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.model.flag")).to.equal(1);
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
