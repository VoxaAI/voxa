"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
var Renderer_1 = require("../src/renderers/Renderer");
var VoxaReply_1 = require("../src/VoxaReply");
var tools_1 = require("./tools");
var views = require("./views");
var rb = new tools_1.AlexaRequestBuilder();
var VoxaReply = /** @class */ (function (_super) {
    __extends(VoxaReply, _super);
    function VoxaReply() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VoxaReply;
}(VoxaReply_1.VoxaReply));
describe("VoxaReply", function () {
    var reply;
    var renderer;
    beforeEach(function () {
        renderer = new Renderer_1.Renderer({ views: views });
        reply = new VoxaReply(new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent")), renderer);
    });
    it("should add the request session to itself on constructor", function () {
        var event = rb.getIntentRequest("SomeIntent");
        event.session.attributes = { key1: "value1", key2: "value2" };
        var request = new AlexaEvent_1.AlexaEvent(event);
        var sessionReply = new VoxaReply(request, renderer);
        chai_1.expect(sessionReply.session.attributes).to.deep.equal(request.session.attributes);
    });
    it("should determine if it has directive", function () {
        reply.response.directives = [{ type: "a" }];
        chai_1.expect(reply.hasDirective("a")).to.be.true;
        chai_1.expect(reply.hasDirective(/^a/)).to.be.true;
        chai_1.expect(reply.hasDirective(function (directive) { return directive.type === "a"; })).to.be.true;
        chai_1.expect(reply.hasDirective("b")).to.be.false;
        chai_1.expect(reply.hasDirective(/^b/)).to.be.false;
        chai_1.expect(reply.hasDirective(function (directive) { return directive.type === "b"; })).to.be.false;
    });
    it("should set yield to true on yield", function () {
        reply.yield();
        chai_1.expect(reply.response.yield).to.be.true;
    });
});
//# sourceMappingURL=VoxaReply.spec.js.map