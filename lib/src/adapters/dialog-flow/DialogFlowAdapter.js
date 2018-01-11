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
const actions_on_google_1 = require("actions-on-google");
const ssml_1 = require("../../ssml");
const VoxaAdapter_1 = require("../VoxaAdapter");
const DialogFlowEvent_1 = require("./DialogFlowEvent");
const DialogFlowReply_1 = require("./DialogFlowReply");
const directives_1 = require("./directives");
class DialogFlowAdapter extends VoxaAdapter_1.VoxaAdapter {
    static sessionToContext(session) {
        if (!(session && !_.isEmpty(session.attributes))) {
            return [];
        }
        return _(session.attributes)
            .map((parameters, name) => {
            if (!parameters || _.isEmpty(parameters)) {
                return;
            }
            const currentContext = { name, lifespan: 10000, parameters: {} };
            if (_.isPlainObject(parameters)) {
                currentContext.parameters = parameters;
            }
            else {
                currentContext.parameters[name] = parameters;
            }
            return currentContext;
        })
            .filter()
            .value();
    }
    static google(reply) {
        const speech = ssml_1.toSSML(reply.response.statements.join("\n"));
        const noInputPrompts = [];
        let possibleIntents;
        const richResponse = new actions_on_google_1.Responses.RichResponse();
        if (reply.response.reprompt) {
            noInputPrompts.push({
                ssml: reply.response.reprompt,
            });
        }
        if (speech) {
            richResponse.addSimpleResponse(speech);
        }
        _.map(reply.response.directives, (directive) => {
            if (directive.suggestions) {
                richResponse.addSuggestions(directive.suggestions);
            }
            else if (directive.basicCard) {
                richResponse.addBasicCard(directive.basicCard);
            }
            else if (directive.possibleIntents) {
                possibleIntents = directive.possibleIntents;
            }
        });
        return {
            expectUserResponse: !reply.response.terminate,
            isSsml: true,
            noInputPrompts,
            possibleIntents,
            richResponse,
        };
    }
    static toDialogFlowResponse(voxaReply) {
        const speech = ssml_1.toSSML(voxaReply.response.statements.join("\n"));
        const contextOut = DialogFlowAdapter.sessionToContext(voxaReply.session);
        const source = _.get(voxaReply, "voxaEvent.originalRequest.source");
        const integrations = {
            google: DialogFlowAdapter.google,
        };
        const response = {
            contextOut,
            data: {},
            source: "Voxa",
            speech,
        };
        if (integrations[source]) {
            response.data[source] = integrations[source](voxaReply);
        }
        return response;
    }
    constructor(voxaApp) {
        super(voxaApp);
        _.map([directives_1.List, directives_1.Carousel, directives_1.Suggestions, directives_1.BasicCard], (handler) => voxaApp.registerDirectiveHandler(handler, handler.name));
    }
    execute(rawEvent, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new DialogFlowEvent_1.DialogFlowEvent(rawEvent, context);
            const voxaReply = yield this.app.execute(event, DialogFlowReply_1.DialogFlowReply);
            return DialogFlowAdapter.toDialogFlowResponse(voxaReply);
        });
    }
}
exports.DialogFlowAdapter = DialogFlowAdapter;
//# sourceMappingURL=DialogFlowAdapter.js.map