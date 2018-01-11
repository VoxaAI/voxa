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
function HomeCard(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        const card = yield reply.render(templatePath);
        if (reply.hasDirective("card")) {
            throw new Error("At most one card can be specified in a response");
        }
        reply.response.directives.push({ card, type: "card" });
    });
}
exports.HomeCard = HomeCard;
function DialogDelegate(slots) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (!event.intent) {
            throw new Error("An intent is required");
        }
        const directive = {
            type: "Dialog.Delegate",
        };
        if (slots) {
            const directiveSlots = _(slots)
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
        reply.yield();
        reply.response.terminate = false;
        reply.response.directives.push(directive);
    });
}
exports.DialogDelegate = DialogDelegate;
function RenderTemplate(templatePath, token) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (!reply.supportsDisplayInterface) {
            return;
        }
        if (reply.hasDirective("Display.RenderTemplate")) {
            throw new Error("At most one Display.RenderTemplate directive can be specified in a response");
        }
        if (_.isString(templatePath)) {
            const directive = yield reply.render(templatePath, { token });
            reply.response.directives.push(directive);
        }
        else {
            reply.response.directives.push(templatePath);
        }
    });
}
exports.RenderTemplate = RenderTemplate;
function AccountLinkingCard() {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (reply.hasDirective("card")) {
            throw new Error("At most one card can be specified in a response");
        }
        reply.response.directives.push({ card: { type: "LinkAccount" }, type: "card" });
    });
}
exports.AccountLinkingCard = AccountLinkingCard;
function Hint(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (reply.hasDirective("Hint")) {
            throw new Error("At most one Hint directive can be specified in a response");
        }
        const text = yield reply.render(templatePath);
        reply.response.directives.push({
            hint: {
                text,
                type: "PlainText",
            },
            type: "Hint",
        });
    });
}
exports.Hint = Hint;
function PlayAudio(url, token, offsetInMilliseconds, playBehavior = "REPLACE") {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (reply.hasDirective("VideoApp.Launch")) {
            throw new Error("Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response");
        }
        reply.response.directives.push({
            audioItem: { stream: { token, url, offsetInMilliseconds } },
            playBehavior,
            type: "AudioPlayer.Play",
        });
    });
}
exports.PlayAudio = PlayAudio;
//# sourceMappingURL=directives.js.map