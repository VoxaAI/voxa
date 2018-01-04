"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const _ = require("lodash");
const uuid = require("uuid");
const ssml_1 = require("../../ssml");
const VoxaReply_1 = require("../../VoxaReply");
class CortanaReply extends VoxaReply_1.VoxaReply {
    toJSON() {
        const speak = ssml_1.toSSML(this.response.statements.join("\n"));
        const text = this.response.statements.join("\n");
        const inputHint = this.response.terminate ? "acceptingInput" : "expectingInput";
        const attachmentTypes = [
            botbuilder_1.ReceiptCard,
            botbuilder_1.Keyboard,
            botbuilder_1.SigninCard,
        ];
        const attachments = _(this.response.directives)
            .filter((directive) => !!directive.attachment)
            .map("attachment.data")
            .value();
        const suggestedActions = _(this.response.directives)
            .filter((directive) => !!directive.suggestedActions)
            .map("suggestedActions")
            .find();
        return {
            address: this.voxaEvent.rawEvent.address,
            agent: "Voxa",
            attachments,
            channelId: this.voxaEvent.rawEvent.address.channelId,
            conversation: {
                id: this.voxaEvent.session.sessionId,
            },
            from: {
                id: this.voxaEvent.rawEvent.address.bot.id,
            },
            id: uuid.v1(),
            inputHint,
            locale: this.voxaEvent.request.locale,
            recipient: {
                id: this.voxaEvent.user.id,
                name: this.voxaEvent.user.name,
            },
            replyToId: this.voxaEvent.rawEvent.address.id,
            source: this.voxaEvent.rawEvent.source,
            sourceEvent: "",
            speak,
            suggestedActions: suggestedActions ? suggestedActions.toSuggestedActions() : undefined,
            text,
            textFormat: "plain",
            timestamp: new Date().toISOString(),
            type: "message",
            user: {
                id: this.voxaEvent.rawEvent.address.user.id,
            },
        };
    }
}
exports.CortanaReply = CortanaReply;
//# sourceMappingURL=CortanaReply.js.map