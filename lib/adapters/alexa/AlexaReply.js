"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaReply_1 = require("../../VoxaReply");
const ssml_1 = require("../../ssml");
const SSML = 'SSML';
class AlexaReply extends VoxaReply_1.VoxaReply {
    get supportsDisplayInterface() {
        return !!_.get(this, 'voxaEvent.context.System.device.supportedInterfaces.Display');
    }
    toJSON() {
        const say = ssml_1.toSSML(this.response.statements.join('\n'));
        const reprompt = ssml_1.toSSML(this.response.reprompt);
        const directives = _.reject(this.response.directives, { type: 'card' });
        const card = _.find(this.response.directives, { type: 'card' });
        const alexaResponse = {};
        if (say) {
            alexaResponse.outputSpeech = AlexaReply.createSpeechObject(say);
        }
        if (card) {
            alexaResponse.card = card.card;
        }
        if (this.voxaEvent.request.type !== 'SessionEndedRequest') {
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
        const returnResult = {
            version: '1.0',
            response: alexaResponse,
        };
        if (this.session && !_.isEmpty(this.session.attributes)) {
            returnResult.sessionAttributes = this.session.attributes;
        }
        return returnResult;
    }
    static createSpeechObject(speech) {
        return {
            type: SSML,
            ssml: speech || '',
        };
    }
}
exports.AlexaReply = AlexaReply;
//# sourceMappingURL=AlexaReply.js.map