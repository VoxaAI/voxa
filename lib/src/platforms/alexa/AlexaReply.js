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
var _ = require("lodash");
var ssml_1 = require("../../ssml");
var VoxaReply_1 = require("../../VoxaReply");
var SSML = "SSML";
var AlexaReply = /** @class */ (function (_super) {
    __extends(AlexaReply, _super);
    function AlexaReply() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlexaReply.createSpeechObject = function (speech) {
        return {
            ssml: speech || "",
            type: SSML,
        };
    };
    Object.defineProperty(AlexaReply.prototype, "supportsDisplayInterface", {
        get: function () {
            return !!_.get(this, "voxaEvent.context.System.device.supportedInterfaces.Display");
        },
        enumerable: true,
        configurable: true
    });
    AlexaReply.prototype.toJSON = function () {
        var say = ssml_1.toSSML(this.response.statements.join("\n"));
        var reprompt = ssml_1.toSSML(this.response.reprompt);
        var directives = _.reject(this.response.directives, { type: "card" });
        var card = _.find(this.response.directives, { type: "card" });
        var alexaResponse = {};
        if (say) {
            alexaResponse.outputSpeech = AlexaReply.createSpeechObject(say);
        }
        if (card) {
            alexaResponse.card = card.card;
        }
        if (this.voxaEvent.request.type !== "SessionEndedRequest") {
            alexaResponse.shouldEndSession = !!this.response.terminate;
        }
        if (reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: AlexaReply.createSpeechObject(reprompt),
            };
        }
        if (directives.length > 0) {
            alexaResponse.directives = directives;
        }
        var returnResult = {
            response: alexaResponse,
            version: "1.0",
        };
        if (this.session && !_.isEmpty(this.session.attributes)) {
            returnResult.sessionAttributes = this.session.attributes;
        }
        return returnResult;
    };
    return AlexaReply;
}(VoxaReply_1.VoxaReply));
exports.AlexaReply = AlexaReply;
//# sourceMappingURL=AlexaReply.js.map