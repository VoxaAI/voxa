import { expect } from "chai";
import { VoxaPlatform } from "../src/platforms/VoxaPlatform";
import { VoxaApp } from "../src/VoxaApp";
import { AlexaRequestBuilder } from "./tools";
import { views } from "./views";

describe("VoxaPlatform", () => {
  describe("lambda", () => {
    it("should call the execute method with the event and context", (done) => {
      const app = new VoxaApp({ views });

      class Platform extends VoxaPlatform {
        public execute(e: any, c: any) {
          return Promise.resolve({ event: e, context: c });
        }
      }

      const adapter = new Platform(app);
      const handler = adapter.lambda();
      const event = new AlexaRequestBuilder().getSessionEndedRequest();
      const context = { context: "context" };

      handler(event, context, (error: Error|null, result: any) => {
        expect(error).to.be.null;
        expect(result.context).to.deep.equal(context);
        expect(result.event).to.deep.equal(event);
        done();
      });
    });
  });
});
