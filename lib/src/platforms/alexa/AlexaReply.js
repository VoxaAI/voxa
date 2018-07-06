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
const VoxaReply_1 = require("../../VoxaReply");
class AlexaReply {
    constructor() {
        this.version = "1.0";
        this.response = {};
    }
    get hasMessages() {
        return !!this.response.outputSpeech;
    }
    get hasDirectives() {
        if (this.response.card) {
            return true;
        }
        if (!!this.response.directives) {
            return true;
        }
        return false;
    }
    get hasTerminated() {
        return !!this.response && !!this.response.shouldEndSession;
    }
    saveSession(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sessionAttributes = yield event.model.serialize();
        });
    }
    terminate() {
        if (!this.response) {
            this.response = {};
        }
        this.response.shouldEndSession = true;
    }
    get speech() {
        return _.get(this.response, "outputSpeech.ssml", "");
    }
    get reprompt() {
        return _.get(this.response, "reprompt.outputSpeech.ssml", "");
    }
    addStatement(statement, isPlain = false) {
        if (!("shouldEndSession" in this.response)) {
            this.response.shouldEndSession = false;
        }
        let ssml = _.get(this.response, "outputSpeech.ssml", "<speak></speak>");
        ssml = VoxaReply_1.addToSSML(ssml, statement);
        this.response.outputSpeech = {
            ssml,
            type: "SSML",
        };
    }
    addReprompt(statement, isPlain = false) {
        const type = "SSML";
        let ssml = _.get(this.response.reprompt, "outputSpeech.ssml", "<speak></speak>");
        ssml = VoxaReply_1.addToSSML(ssml, statement);
        this.response.reprompt = {
            outputSpeech: {
                ssml,
                type: "SSML",
            },
        };
    }
    clear() {
        this.response = {};
    }
    hasDirective(type) {
        if (!this.hasDirectives) {
            return false;
        }
        let allDirectives = this.response.directives || [];
        if (this.response.card) {
            allDirectives = _.concat(allDirectives, { type: "card", card: this.response.card });
        }
        return allDirectives.some((directive) => {
            if (_.isRegExp(type)) {
                return !!type.exec(directive.type);
            }
            if (_.isString(type)) {
                return type === directive.type;
            }
            throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
        });
    }
}
exports.AlexaReply = AlexaReply;
//# sourceMappingURL=AlexaReply.js.map