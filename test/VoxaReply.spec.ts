import("mocha");

import { expect } from "chai";

import { addToSSML, addToText } from "../src/VoxaReply";

describe("VoxaReply", () => {
  describe("addToText", () => {
    it("should return the statement if no text is passed", () => {
      expect(addToText("", "statement")).to.equal("statement");
    });
    it("should append to the original text", () => {
      expect(addToText("text", "statement")).to.equal("text statement");
    });
  });
});
