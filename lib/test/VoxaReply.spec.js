"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Promise.resolve().then(() => require("mocha"));
const chai_1 = require("chai");
const VoxaReply_1 = require("../src/VoxaReply");
describe("VoxaReply", () => {
    describe("addToText", () => {
        it("should return the statement if no text is passed", () => {
            chai_1.expect(VoxaReply_1.addToText("", "statement")).to.equal("statement");
        });
        it("should append to the original text", () => {
            chai_1.expect(VoxaReply_1.addToText("text", "statement")).to.equal("text statement");
        });
    });
});
//# sourceMappingURL=VoxaReply.spec.js.map