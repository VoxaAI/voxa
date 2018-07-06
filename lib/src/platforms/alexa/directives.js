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
const _ = require("lodash");
function isCard(card) {
    if (!("type" in card)) {
        return false;
    }
    return _.includes(["Standard", "Simple", "LinkAccount", "AskForPermissionsConsent"], card.type);
}
class HomeCard {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reply.hasDirective("card")) {
                throw new Error("At most one card can be specified in a response");
            }
            let card;
            if (_.isString(this.viewPath)) {
                card = yield event.renderer.renderPath(this.viewPath, event);
                if (!isCard(card)) {
                    throw new Error("The view should return a Card like object");
                }
            }
            else if (isCard(this.viewPath)) {
                card = this.viewPath;
            }
            else {
                throw new Error("Argument should be a viewPath or a Card like object");
            }
            reply.response.card = card;
        });
    }
}
HomeCard.platform = "alexa";
HomeCard.key = "alexaCard";
exports.HomeCard = HomeCard;
class Hint {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reply.hasDirective("Hint")) {
                throw new Error("At most one Hint directive can be specified in a response");
            }
            const response = reply.response || {};
            if (!response.directives) {
                response.directives = [];
            }
            const text = yield event.renderer.renderPath(this.viewPath, event);
            response.directives.push({
                hint: {
                    text,
                    type: "PlainText",
                },
                type: "Hint",
            });
            reply.response = response;
        });
    }
}
Hint.platform = "alexa";
Hint.key = "alexaHint";
exports.Hint = Hint;
class DialogDelegate {
    constructor(slots) {
        this.slots = slots;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.intent) {
                throw new Error("An intent is required");
            }
            const directive = {
                type: "Dialog.Delegate",
            };
            if (this.slots) {
                const directiveSlots = _(this.slots)
                    .map((value, key) => {
                    const data = {
                        confirmationStatus: "NONE",
                        name: key,
                    };
                    if (value) {
                        data.value = value;
                    }
                    return [key, data];
                })
                    .fromPairs()
                    .value();
                directive.updatedIntent = {
                    confirmationStatus: "NONE",
                    name: event.intent.name,
                    slots: directiveSlots,
                };
            }
            const response = reply.response;
            response.directives = response.directives || [];
            response.directives.push(directive);
            reply.response = response;
        });
    }
}
DialogDelegate.platform = "alexa";
DialogDelegate.key = "alexaDialogDelegate";
exports.DialogDelegate = DialogDelegate;
class RenderTemplate {
    constructor(viewPath, token) {
        if (_.isString(viewPath)) {
            this.viewPath = viewPath;
        }
        else {
            this.template = viewPath;
        }
        this.token = token;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let template;
            if (reply.hasDirective("Display.RenderTemplate")) {
                throw new Error("At most one Display.RenderTemplate directive can be specified in a response");
            }
            const context = event.rawEvent.context;
            if (!context) {
                return;
            }
            if (!context.System.device.supportedInterfaces.Display) {
                return;
            }
            if (this.viewPath) {
                template = yield event.renderer.renderPath(this.viewPath, event, { token: this.token });
            }
            else {
                template = this.template;
            }
            const response = reply.response;
            if (!response.directives) {
                response.directives = [];
            }
            response.directives.push(template);
            reply.response = response;
        });
    }
}
RenderTemplate.key = "alexaRenderTemplate";
RenderTemplate.platform = "alexa";
exports.RenderTemplate = RenderTemplate;
class AccountLinkingCard {
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reply.hasDirective("card")) {
                throw new Error("At most one card can be specified in a response");
            }
            const card = { type: "LinkAccount" };
            reply.response.card = card;
        });
    }
}
AccountLinkingCard.key = "alexaAccountLinkingCard";
AccountLinkingCard.platform = "alexa";
exports.AccountLinkingCard = AccountLinkingCard;
class PlayAudio {
    constructor(url, token, offsetInMilliseconds, behavior = "REPLACE_ALL", metadata = {}) {
        this.url = url;
        this.token = token;
        this.offsetInMilliseconds = offsetInMilliseconds;
        this.behavior = behavior;
        this.metadata = metadata;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reply.hasDirective("VideoApp.Launch")) {
                throw new Error("Do not include both an AudioPlayer.Play" +
                    " directive and a VideoApp.Launch directive in the same response");
            }
            const response = reply.response;
            if (!response.directives) {
                response.directives = [];
            }
            response.directives.push({
                audioItem: {
                    metadata: this.metadata,
                    stream: {
                        offsetInMilliseconds: this.offsetInMilliseconds,
                        token: this.token,
                        url: this.url,
                    },
                },
                playBehavior: this.behavior,
                type: "AudioPlayer.Play",
            });
            reply.response = response;
        });
    }
}
PlayAudio.key = "alexaPlayAudio";
PlayAudio.platform = "alexa";
exports.PlayAudio = PlayAudio;
class StopAudio {
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = reply.response;
            if (!response.directives) {
                response.directives = [];
            }
            response.directives.push({
                type: "AudioPlayer.Stop",
            });
            reply.response = response;
        });
    }
}
StopAudio.key = "alexaStopAudio";
StopAudio.platform = "alexa";
exports.StopAudio = StopAudio;
//# sourceMappingURL=directives.js.map