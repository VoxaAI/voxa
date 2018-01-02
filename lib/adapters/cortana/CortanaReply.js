"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const uuid = require("uuid");
const VoxaReply_1 = require("../../VoxaReply");
const ssml_1 = require("../../ssml");
const botbuilder_1 = require("botbuilder");
class CortanaReply extends VoxaReply_1.VoxaReply {
    toJSON() {
        const speak = ssml_1.toSSML(this.response.statements.join('\n'));
        const text = this.response.statements.join('\n');
        const inputHint = this.response.terminate ? 'acceptingInput' : 'expectingInput';
        const attachmentTypes = [
            botbuilder_1.ReceiptCard,
            botbuilder_1.Keyboard,
            botbuilder_1.SigninCard
        ];
        const attachments = _(this.response.directives)
            .filter(directive => !!directive.attachment)
            .map('attachment.data')
            .value();
        const suggestedActions = _(this.response.directives)
            .filter(directive => !!directive.suggestedActions)
            .map('suggestedActions')
            .find();
        console.log({ suggestedActions, attachments });
        return {
            inputHint,
            speak,
            text,
            type: 'message',
            agent: 'Voxa',
            source: this.voxaEvent._raw.source,
            sourceEvent: '',
            address: this.voxaEvent._raw.address,
            user: {
                id: this.voxaEvent._raw.address.user.id
            },
            id: uuid.v1(),
            timestamp: new Date().toISOString(),
            channelId: this.voxaEvent._raw.address.channelId,
            from: {
                id: this.voxaEvent._raw.address.bot.id,
            },
            conversation: {
                id: this.voxaEvent.session.sessionId,
            },
            recipient: {
                id: this.voxaEvent.user.id,
                name: this.voxaEvent.user.name,
            },
            textFormat: 'plain',
            locale: this.voxaEvent.request.locale,
            attachments,
            suggestedActions: suggestedActions ? suggestedActions.toSuggestedActions() : undefined,
            replyToId: this.voxaEvent._raw.address.id,
        };
    }
}
exports.CortanaReply = CortanaReply;
//# sourceMappingURL=CortanaReply.js.map