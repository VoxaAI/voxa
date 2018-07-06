"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const _ = require("lodash");
const DialogFlowReply_1 = require("../../src/platforms/dialog-flow/DialogFlowReply");
/* tslint:disable-next-line:no-var-requires */
const rawEvent = require("../requests/dialog-flow/launchIntent.json");
describe("DialogFlowReply", () => {
    let reply;
    beforeEach(() => {
        reply = new DialogFlowReply_1.DialogFlowReply();
    });
    describe("addStatement", () => {
        it("should add to both the speech and richResponse", () => {
            reply.addStatement("THIS IS A TEST");
            chai_1.expect(reply.speech).to.equal("<speak>THIS IS A TEST</speak>");
            chai_1.expect(_.get(reply, "payload.google.richResponse.items[0]")).to.deep.equal({
                simpleResponse: { textToSpeech: "<speak>THIS IS A TEST</speak>" },
            });
        });
    });
    describe("clear", () => {
        it("should empty the rich response, speech and reprompts", () => {
            reply.addStatement("THIS IS A TEST");
            reply.addReprompt("THIS IS A TEST REPROMPT");
            reply.clear();
            chai_1.expect(reply.speech).to.equal("");
            chai_1.expect(_.get(reply, "payload.google.richResponse")).to.be.undefined;
            chai_1.expect(reply.payload.google.noInputPrompts).to.be.empty;
        });
    });
});
//# sourceMappingURL=DialogFlowReply.spec.js.map