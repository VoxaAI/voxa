"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const _ = require("lodash");
const striptags = require("striptags");
class SigninCard {
    constructor(url, cardText = "", buttonTitle = "") {
        this.url = url;
        this.cardText = cardText;
        this.buttonTitle = buttonTitle;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const card = new botbuilder_1.SigninCard();
            card.button(this.buttonTitle, this.url);
            card.text(this.cardText);
            const attachments = reply.attachments || [];
            attachments.push(card.toAttachment());
            reply.attachments = attachments;
        });
    }
}
SigninCard.platform = "botframework";
SigninCard.key = "botframeworkSigninCard";
exports.SigninCard = SigninCard;
class HeroCard {
    constructor(viewPath) {
        if (_.isString(viewPath)) {
            this.viewPath = viewPath;
        }
        else {
            this.card = viewPath;
        }
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let card;
            if (this.viewPath) {
                if (!event.renderer) {
                    throw new Error("event.renderer is missing");
                }
                card = yield event.renderer.renderPath(this.viewPath, event);
            }
            else {
                card = this.card;
            }
            const attachments = reply.attachments || [];
            attachments.push(card.toAttachment());
            reply.attachments = attachments;
        });
    }
}
HeroCard.platform = "botframework";
HeroCard.key = "botframeworkHeroCard";
exports.HeroCard = HeroCard;
class SuggestedActions {
    constructor(viewPath) {
        if (_.isString(viewPath)) {
            this.viewPath = viewPath;
        }
        else {
            this.suggestedActions = viewPath;
        }
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let suggestedActions;
            if (this.viewPath) {
                if (!event.renderer) {
                    throw new Error("event.renderer is missing");
                }
                suggestedActions = yield event.renderer.renderPath(this.viewPath, event);
            }
            else {
                suggestedActions = this.suggestedActions;
            }
            reply.suggestedActions = suggestedActions.toSuggestedActions();
        });
    }
}
SuggestedActions.key = "botframeworkSuggestedActions";
SuggestedActions.platform = "botframework";
exports.SuggestedActions = SuggestedActions;
class AudioCard {
    constructor(url, profile = "") {
        this.profile = profile;
        if (_.isString(url)) {
            this.url = url;
        }
        else {
            this.audioCard = url;
        }
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let audioCard;
            if (this.url) {
                audioCard = new botbuilder_1.AudioCard();
                const cardMedia = { url: this.url, profile: this.profile };
                audioCard.media([cardMedia]);
            }
            else {
                audioCard = this.audioCard;
            }
            if (reply.hasMessages) {
                // we want to send stuff before the audio card
                reply.inputHint = "ignoringInput";
                yield reply.send(event);
                reply.clear();
            }
            // and now we add the card
            const attachments = reply.attachments || [];
            if (!audioCard) {
                throw new Error("audioCard was not initialized");
            }
            attachments.push(audioCard.toAttachment());
            reply.attachments = attachments;
            reply.terminate();
            transition.flow = "terminate";
            return yield reply.send(event);
        });
    }
}
AudioCard.key = "botframeworkAudioCard";
AudioCard.platform = "botframework";
exports.AudioCard = AudioCard;
// i want to add plain statements
class Ask {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.rawEvent.address.channelId !== "webchat") {
                return;
            }
            if (!event.renderer) {
                throw new Error("event.renderer is missing");
            }
            const statement = yield event.renderer.renderPath(this.viewPath, event);
            if (_.isString(statement)) {
                reply.addStatement(striptags(statement), true);
            }
            else if (statement.ask) {
                reply.addStatement(striptags(statement.ask), true);
            }
        });
    }
}
Ask.key = "ask";
Ask.platform = "botframework";
exports.Ask = Ask;
// i want to add plain statements
class Say {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.rawEvent.address.channelId !== "webchat") {
                return;
            }
            if (!event.renderer) {
                throw new Error("event.renderer is missing");
            }
            const statement = yield event.renderer.renderPath(this.viewPath, event);
            reply.addStatement(striptags(statement), true);
        });
    }
}
Say.key = "say";
Say.platform = "botframework";
exports.Say = Say;
//# sourceMappingURL=directives.js.map