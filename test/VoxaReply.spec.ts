import { expect } from "chai";
import * as _ from "lodash";
import "mocha";
import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { Renderer } from "../src/renderers/Renderer";
import { VoxaReply as BaseVoxaReply } from "../src/VoxaReply";
import { AlexaRequestBuilder } from "./tools";
import * as views from "./views";

const rb = new AlexaRequestBuilder();

class VoxaReply extends BaseVoxaReply {

}

describe("VoxaReply", () => {
  let reply: VoxaReply;
  let renderer: Renderer;

  beforeEach(() => {
    renderer = new Renderer({ views });
    reply = new VoxaReply(new AlexaEvent(rb.getIntentRequest("SomeIntent")), renderer);
  });

  it("should add the request session to itself on constructor", () => {
    const event = rb.getIntentRequest("SomeIntent");
    event.session.attributes = { key1: "value1", key2: "value2" };

    const request = new AlexaEvent(event);
    const sessionReply = new VoxaReply(request, renderer);
    expect(sessionReply.session.attributes).to.deep.equal(request.session.attributes);
  });

  it("should determine if it has directive", () => {
    reply.response.directives = [{ type: "a" }];

    expect(reply.hasDirective("a")).to.be.true;
    expect(reply.hasDirective(/^a/)).to.be.true;
    expect(reply.hasDirective((directive: any) => directive.type === "a")).to.be.true;

    expect(reply.hasDirective("b")).to.be.false;
    expect(reply.hasDirective(/^b/)).to.be.false;
    expect(reply.hasDirective((directive) => directive.type === "b")).to.be.false;
  });

  it("should set yield to true on yield", () => {
    reply.yield();
    expect(reply.response.yield).to.be.true;
  });
});
