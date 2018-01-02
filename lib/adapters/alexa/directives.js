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
        if (_.filter(reply.response.directives, { type: 'card' }).length > 0) {
            throw new Error('At most one card can be specified in a response');
        }
        reply.response.directives.push({ card, type: 'card' });
    });
}
exports.HomeCard = HomeCard;
function DialogDelegate(slots) {
    return (reply, event) => {
        reply.yield();
        reply.response.directives.push({
            type: "Dialog.Delegate",
            updatedIntent: {
                name: event.intent.name,
                confirmationStatus: '',
                slots: _.mapValues((v, k) => ({ name: k, value: v })),
            },
        });
    };
}
exports.DialogDelegate = DialogDelegate;
function RenderTemplate(templatePath, token) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (!reply.supportsDisplayInterface) {
            return;
        }
        if (_.filter(reply.response.directives, { type: 'Display.RenderTemplate' }).length > 0) {
            throw new Error('At most one Display.RenderTemplate directive can be specified in a response');
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
    return (reply, event) => {
        if (_.filter(reply.response.directives, { type: 'card' }).length > 0) {
            throw new Error('At most one card can be specified in a response');
        }
        reply.response.directives.push({ card: { type: 'LinkAccount' }, type: 'card' });
    };
}
exports.AccountLinkingCard = AccountLinkingCard;
function Hint(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (_.filter(reply.response.directives, { type: 'Hint' }).length > 0) {
            throw new Error('At most one Hint directive can be specified in a response');
        }
        if (_.isString(templatePath)) {
            const directive = yield reply.render(templatePath);
            reply.response.directives.push(directive);
        }
        else {
            reply.response.directives.push(templatePath);
        }
    });
}
exports.Hint = Hint;
function PlayAudio(url, token, offsetInMilliseconds, playBehavior = 'REPLACE') {
    return (reply, event) => {
        if (_.find(reply.response.directives, { type: 'AudioPlayer.Play' }) && _.find(reply.response.directives, { type: 'VideoApp.Launch' })) {
            throw new Error('Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response');
        }
        reply.response.directives.push({
            type: "AudioPlayer.Play",
            playBehavior,
            audioItem: { stream: { token, url, offsetInMilliseconds } }
        });
    };
}
exports.PlayAudio = PlayAudio;
//# sourceMappingURL=directives.js.map