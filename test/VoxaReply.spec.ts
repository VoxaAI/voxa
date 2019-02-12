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
  describe("addToSSML", () => {
    it("should append a statement to ssml by inserting a newline between", () => {
      expect(addToSSML("<speak>Howdy</speak>", "there")).to.equal("<speak>Howdy\nthere</speak>");
    });

    it("handles SSML that contains newlines", () => {
      expect(addToSSML("<speak>Howdy\n and a good day to you</speak>", "there"))
        .to.equal("<speak>Howdy\n and a good day to you\nthere</speak>");
    });

    it("should replace & with amp;", () => {
      expect(addToSSML("", "&")).to.equal("<speak>&amp;</speak>");
    });

    it("should throw an error for invalid SSML;", () => {
      expect(() => addToSSML("", "<audio /> Test</audio>")).to.throw(Error, "closing tag speak is expected inplace of audio.");
    });
  });
});
