"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const AlexaEvent_1 = require("../src/adapters/alexa/AlexaEvent");
const Renderer_1 = require("../src/renderers/Renderer");
const VoxaReply_1 = require("../src/VoxaReply");
const tools_1 = require("./tools");
const views = require("./views");
const rb = new tools_1.AlexaRequestBuilder();
class VoxaReply extends VoxaReply_1.VoxaReply {
}
describe("VoxaReply", () => {
    let reply;
    let renderer;
    beforeEach(() => {
        renderer = new Renderer_1.Renderer({ views });
        reply = new VoxaReply(new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent")), renderer);
    });
    it("should add the request session to itself on constructor", () => {
        const event = rb.getIntentRequest("SomeIntent");
        event.session.attributes = { key1: "value1", key2: "value2" };
        const request = new AlexaEvent_1.AlexaEvent(event);
        const sessionReply = new VoxaReply(request, renderer);
        chai_1.expect(sessionReply.session.attributes).to.deep.equal(request.session.attributes);
    });
    it("should determine if it has directive", () => {
        reply.response.directives = [{ type: "a" }];
        chai_1.expect(reply.hasDirective("a")).to.be.true;
        chai_1.expect(reply.hasDirective(/^a/)).to.be.true;
        chai_1.expect(reply.hasDirective((directive) => directive.type === "a")).to.be.true;
        chai_1.expect(reply.hasDirective("b")).to.be.false;
        chai_1.expect(reply.hasDirective(/^b/)).to.be.false;
        chai_1.expect(reply.hasDirective((directive) => directive.type === "b")).to.be.false;
    });
    //it("should throw on unknown directive type spec", () => {
    ////const badFn = () =>  reply.hasDirective(true);
    ////reply.response.directives = [{ type: "a" }];
    ////expect(badFn).to.throw(Error, "Do not know how to use a boolean to find a directive");
    //});
    it("should set yield to true on yield", () => {
        reply.yield();
        chai_1.expect(reply.response.yield).to.be.true;
    });
});
//# sourceMappingURL=VoxaReply.spec.js.map