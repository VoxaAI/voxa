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
var botbuilder_1 = require("botbuilder");
var _ = require("lodash");
var striptags = require("striptags");
var uuid = require("uuid");
var ssml_1 = require("../../ssml");
var VoxaReply_1 = require("../../VoxaReply");
var directives_1 = require("./directives");
var CortanaReply = /** @class */ (function (_super) {
    __extends(CortanaReply, _super);
    function CortanaReply() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CortanaReply.prototype.toJSON = function () {
        var speak = ssml_1.toSSML(this.response.statements.join("\n"));
        var text = striptags(this.response.statements.join("\n"));
        var inputHint = this.response.terminate ? "acceptingInput" : "expectingInput";
        var attachmentTypes = [
            botbuilder_1.ReceiptCard,
            botbuilder_1.Keyboard,
            botbuilder_1.SigninCard,
        ];
        var attachments = _(this.response.directives)
            .filter({ type: "attachment" })
            .map("attachment")
            .map(function (at) { return at.toAttachment(); })
            .filter(function (at) { return directives_1.isAttachment(at); })
            .value();
        var suggestedActions = _(this.response.directives)
            .filter({ type: "suggestedActions" })
            .map("suggestedActions")
            .filter(directives_1.isSuggestedActions)
            .find();
        return {
            address: this.voxaEvent.rawEvent.address,
            agent: "Voxa",
            attachments: attachments,
            channelId: this.voxaEvent.rawEvent.address.channelId,
            conversation: {
                id: this.voxaEvent.session.sessionId,
            },
            from: {
                id: this.voxaEvent.rawEvent.address.bot.id,
            },
            id: uuid.v1(),
            inputHint: inputHint,
            locale: this.voxaEvent.request.locale,
            recipient: {
                id: this.voxaEvent.user.id,
                name: this.voxaEvent.user.name,
            },
            replyToId: this.voxaEvent.rawEvent.address.id,
            source: this.voxaEvent.rawEvent.source,
            sourceEvent: "",
            speak: speak,
            suggestedActions: suggestedActions ? suggestedActions.toSuggestedActions() : undefined,
            text: text,
            textFormat: "plain",
            timestamp: new Date().toISOString(),
            type: "message",
            user: {
                id: this.voxaEvent.rawEvent.address.user.id,
            },
        };
    };
    return CortanaReply;
}(VoxaReply_1.VoxaReply));
exports.CortanaReply = CortanaReply;
//# sourceMappingURL=CortanaReply.js.map