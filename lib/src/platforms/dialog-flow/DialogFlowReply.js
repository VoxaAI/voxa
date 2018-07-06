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
const actions_on_google_1 = require("actions-on-google");
const VoxaReply_1 = require("../../VoxaReply");
class DialogFlowReply {
    constructor() {
        this.outputContexts = [];
        this.fulfillmentText = "";
        this.source = "google";
        this.payload = {
            google: {
                expectUserResponse: true,
                isSsml: true,
            },
        };
    }
    saveSession(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogFlowEvent = event;
            const serializedData = JSON.stringify(yield event.model.serialize());
            dialogFlowEvent.conv.contexts.set("model", 10000, { model: serializedData });
            this.outputContexts = dialogFlowEvent.conv.contexts._serialize();
        });
    }
    get speech() {
        return this.fulfillmentText;
    }
    get hasMessages() {
        return this.fulfillmentText !== "";
    }
    get hasDirectives() {
        return false;
    }
    get hasTerminated() {
        return !this.payload.google.expectUserResponse;
    }
    clear() {
        delete this.payload.google.richResponse;
        this.payload.google.noInputPrompts = [];
        this.fulfillmentText = "";
    }
    terminate() {
        this.payload.google.expectUserResponse = false;
    }
    addStatement(statement) {
        this.fulfillmentText = VoxaReply_1.addToSSML(this.fulfillmentText, statement);
        const richResponse = this.payload.google.richResponse || new actions_on_google_1.RichResponse();
        richResponse.add(VoxaReply_1.addToSSML("", statement));
        this.payload.google.richResponse = richResponse;
    }
    hasDirective(type) {
        return false;
    }
    addReprompt(reprompt) {
        const noInputPrompts = this.payload.google.noInputPrompts || [];
        noInputPrompts.push({
            textToSpeech: reprompt,
        });
        this.payload.google.noInputPrompts = noInputPrompts;
    }
}
exports.DialogFlowReply = DialogFlowReply;
//# sourceMappingURL=DialogFlowReply.js.map