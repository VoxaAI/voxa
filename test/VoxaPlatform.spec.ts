import { expect } from "chai";
import { VoxaPlatform } from "../src/platforms/VoxaPlatform";
import { VoxaApp } from "../src/VoxaApp";
import { AlexaRequestBuilder } from "./tools";
import { views } from "./views";

const rb = new AlexaRequestBuilder();

class Platform extends VoxaPlatform {
  public platform: string = "platform";

  public execute(e: any, c: any) {
    return Promise.resolve({ event: e, context: c });
  }
}

describe("VoxaPlatform", () => {
  describe("lambda", () => {
    it("should call the execute method with the event and context", (done) => {
      const app = new VoxaApp({ views });
      const adapter = new Platform(app);
      const handler = adapter.lambda();
      const event = rb.getSessionEndedRequest();
      const context = { context: "context" };
      const callback = (error: Error|null, result: any) => {
        expect(error).to.be.null;
        expect(result.context).to.deep.equal(context);
        expect(result.event).to.deep.equal(event);
        done();
      };

      handler(event, context, callback);
    });
  });

  describe("lambdaHTTP", () => {
    it("should return a lambda http proxy response object", (done) => {
      const app = new VoxaApp({ views });
      const adapter = new Platform(app);
      const handler = adapter.lambdaHTTP();
      const event = { body: JSON.stringify(rb.getSessionEndedRequest()) };
      const context = { context: "context" };
      const callback = (error: Error|null, result: any) => {
        expect(error).to.be.null;
        expect(result.statusCode).to.equal(200);
        expect(result.headers["Content-Type"]).to.equal("application/json");
        done();
      };

      handler(event, context, callback);
    });
  });

  describe("azureFunction", () => {
    it("should call the execute method with the event body", (done) => {
      const app = new VoxaApp({ views });
      const adapter = new Platform(app);
      const handler = adapter.azureFunction();
      const event = { body: rb.getSessionEndedRequest() };

      const context = { done: (error: Error|null, result: any) => {
        expect(error).to.be.null;
        done();
      }};

      handler(context, event);
    });
  });

  describe("onIntent", () => {
    it("should register onIntent with platform", () => {
      const app = new VoxaApp({ views });
      const adapter = new Platform(app);
      const state = {
        flow: "terminate",
        tell: "Bye",
        to: "die",
      };

      adapter.onIntent("LaunchIntent", state);
      expect(adapter.app.states).to.deep.equal({
        core: {},
        platform: {
          LaunchIntent: {
            name: "LaunchIntent",
            to: {
              flow: "terminate",
              tell: "Bye",
              to: "die",
            },
          },
          entry: {
            name: "entry",
            to: {
              LaunchIntent: "LaunchIntent",
            },
          },
        },
      });
    });
  });

  describe("onIntent", () => {
    it("should register states as platform specific", () => {
      const app = new VoxaApp({ views });
      const adapter = new Platform(app);
      const state = {
        flow: "terminate",
        tell: "Bye",
        to: "die",
      };

      adapter.onState("someState", state);
      expect(adapter.app.states).to.deep.equal({
        core: {},
        platform: {
          someState: {
            name: "someState",
            to: {
              flow: "terminate",
              tell: "Bye",
              to: "die",
            },
          },
        },
      });
    });
  });

});
