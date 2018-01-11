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
const debug = require("debug");
const _ = require("lodash");
const rp = require("request-promise");
const errors_1 = require("request-promise/errors");
const url = require("url");
const VoxaAdapter_1 = require("../VoxaAdapter");
const CortanaEvent_1 = require("./CortanaEvent");
const CortanaReply_1 = require("./CortanaReply");
const log = debug("voxa");
const CortanaRequests = [
    "conversationUpdate",
    "contactRelationUpdate",
    "message",
];
const toAddress = {
    channelId: "channelId",
    conversation: "conversation",
    from: "user",
    id: "id",
    recipient: "bot",
    serviceUrl: "serviceUrl",
};
class CortanaAdapter extends VoxaAdapter_1.VoxaAdapter {
    constructor(voxaApp, config) {
        super(voxaApp, config);
        if (!config.storage) {
            throw new Error("Cortana requires a state storage");
        }
        this.recognizerURI = config.recognizerURI;
        this.storage = config.storage;
        this.applicationId = config.applicationId;
        this.applicationPassword = config.applicationPassword;
        this.qAuthorization = this.getAuthorization();
        this.app.onAfterStateChanged((voxaEvent, reply, transition) => this.partialReply(voxaEvent, reply, transition));
        _.forEach(CortanaRequests, (requestType) => voxaApp.registerRequestHandler(requestType));
    }
    /*
     * Sends a partial reply after every state change
     */
    partialReply(event, reply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!reply.hasMessages && !reply.hasDirectives) {
                return null;
            }
            log("partialReply");
            log({ hasMessages: reply.hasMessages, hasDirectives: reply.hasDirectives, msg: reply.response });
            yield this.replyToActivity(event, reply);
            reply.clear();
            return null;
        });
    }
    getAuthorization() {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = {
                form: {
                    client_id: this.applicationId,
                    client_secret: this.applicationPassword,
                    grant_type: "client_credentials",
                    scope: "https://api.botframework.com/.default",
                },
                json: true,
                method: "POST",
                url: "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
            };
            log("getAuthorization");
            log(requestOptions);
            return rp(requestOptions);
        });
    }
    execute(msg, context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.prepIncomingMessage(msg);
            const stateData = yield this.getStateData(msg);
            const intent = yield this.recognize(msg);
            const event = new CortanaEvent_1.CortanaEvent(msg, context, stateData, intent);
            const reply = yield this.app.execute(event, CortanaReply_1.CortanaReply);
            const promises = [this.saveStateData(event, reply)];
            yield Promise.all(promises);
            return {};
        });
    }
    recognize(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { intents, entities } = yield new Promise((resolve, reject) => {
                if (msg.text) {
                    return botbuilder_1.LuisRecognizer.recognize(msg.text, this.config.recognizerURI, (err, intents, entities) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve({ intents, entities });
                    });
                }
                resolve({});
            });
            if (!intents) {
                return undefined;
            }
            return {
                name: intents[0].intent,
                params: _(entities).map(entityToParam).fromPairs().value(),
                rawIntent: { intents, entities },
            };
            function entityToParam(entity) {
                return [entity.type, entity.entity];
            }
        });
    }
    prepIncomingMessage(msg) {
        // Patch locale and channelData
        moveFieldsTo(msg, msg, {
            channelData: "sourceEvent",
            locale: "textLocale",
        });
        // Ensure basic fields are there
        msg.text = msg.text || "";
        msg.attachments = msg.attachments || [];
        msg.entities = msg.entities || [];
        // Break out address fields
        const address = {};
        moveFieldsTo(msg, address, toAddress);
        msg.address = address;
        msg.source = address.channelId;
        // Check for facebook quick replies
        if (msg.source === "facebook" && msg.sourceEvent && msg.sourceEvent.message && msg.sourceEvent.message.quick_reply) {
            msg.text = msg.sourceEvent.message.quick_reply.payload;
        }
        return msg;
    }
    replyToActivity(event, reply) {
        console.log(JSON.stringify({ event: event.rawEvent }, null, 2));
        const baseUri = event.rawEvent.address.serviceUrl;
        const conversationId = encodeURIComponent(event.session.sessionId);
        const activityId = encodeURIComponent(event.rawEvent.address.id);
        if (!baseUri) {
            throw new Error("serviceUrl is missing");
        }
        const uri = url.resolve(baseUri, `/v3/conversations/${conversationId}/activities/${activityId}`);
        return this.botApiRequest("POST", uri, reply.toJSON());
    }
    getStateData(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.address.conversation) {
                throw new Error("Missing conversation address");
            }
            const conversationId = encodeURIComponent(event.address.conversation.id);
            const userId = encodeURIComponent(event.address.user.id);
            const context = {
                conversationId,
                persistConversationData: false,
                persistUserData: false,
                userId,
            };
            return new Promise((resolve, reject) => {
                this.storage.getData(context, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                });
            });
        });
    }
    saveStateData(event, reply) {
        const conversationId = encodeURIComponent(event.session.sessionId);
        const userId = encodeURIComponent(event.rawEvent.address.user.id);
        const persistConversationData = false;
        const persistUserData = false;
        const context = {
            conversationId,
            persistConversationData,
            persistUserData,
            userId,
        };
        const data = {
            conversationData: {},
            // we're only gonna handle private conversation data, this keeps the code small
            // and more importantly it makes it so the programming model is the same between
            // the different platforms
            privateConversationData: _.get(reply, "session.attributes"),
            userData: {},
        };
        return new Promise((resolve, reject) => {
            this.storage.saveData(context, data, (error) => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }
    botApiRequest(method, uri, body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authorization = yield this.qAuthorization;
                const requestOptions = {
                    method,
                    uri,
                    body,
                    json: true,
                    auth: {
                        bearer: authorization.access_token,
                    },
                };
                log("botApiRequest");
                log(JSON.stringify(requestOptions, null, 2));
                return rp(requestOptions);
            }
            catch (reason) {
                if (reason instanceof errors_1.StatusCodeError) {
                    if (reason.statusCode === 401) {
                        this.qAuthorization = this.getAuthorization();
                        return this.botApiRequest(method, uri, body);
                    }
                }
                throw reason;
            }
        });
    }
}
exports.CortanaAdapter = CortanaAdapter;
function moveFieldsTo(frm, to, fields) {
    if (frm && to) {
        for (const f in fields) {
            if (frm.hasOwnProperty(f)) {
                if (typeof to[f] === "function") {
                    to[fields[f]](frm[f]);
                }
                else {
                    to[fields[f]] = frm[f];
                }
                delete frm[f];
            }
        }
    }
}
exports.moveFieldsTo = moveFieldsTo;
//# sourceMappingURL=CortanaAdapter.js.map