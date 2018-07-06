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
const VoxaPlatform_1 = require("../VoxaPlatform");
const BotFrameworkEvent_1 = require("./BotFrameworkEvent");
const BotFrameworkReply_1 = require("./BotFrameworkReply");
const directives_1 = require("./directives");
const botframeworklog = debug("voxa:botframework");
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
class BotFrameworkPlatform extends VoxaPlatform_1.VoxaPlatform {
    constructor(voxaApp, config) {
        super(voxaApp, config);
        if (!config.storage) {
            throw new Error("Cortana requires a state storage");
        }
        this.recognizerURI = config.recognizerURI;
        this.storage = config.storage;
        this.applicationId = config.applicationId;
        this.applicationPassword = config.applicationPassword;
    }
    // Botframework requires a lot more headers to work than
    // the other platforms
    lambdaHTTP() {
        const ALLOWED_HEADERS = [
            "Content-Type",
            "X-Amz-Date",
            "Authorization",
            "X-Api-Key",
            "X-Amz-Security-Token",
            "X-Amz-User-Agent",
            "x-ms-client-session-id",
            "x-ms-client-request-id",
            "x-ms-effective-locale",
        ];
        return (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
            const response = {
                body: "{}",
                headers: {
                    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(","),
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                statusCode: 200,
            };
            if (event.httpMethod !== "POST") {
                return callback(null, response);
            }
            try {
                const body = JSON.parse(event.body || "");
                const result = yield this.execute(body, context);
                response.body = JSON.stringify(result);
                return callback(null, response);
            }
            catch (error) {
                return callback(error);
            }
        });
    }
    getDirectiveHandlers() {
        return [
            directives_1.HeroCard,
            directives_1.SuggestedActions,
            directives_1.AudioCard,
            directives_1.Ask,
            directives_1.SigninCard,
            directives_1.Say,
        ];
    }
    getPlatformRequests() {
        return CortanaRequests;
    }
    execute(msg, context) {
        return __awaiter(this, void 0, void 0, function* () {
            msg = prepIncomingMessage(msg);
            const stateData = yield this.getStateData(msg);
            const intent = yield this.recognize(msg);
            const event = new BotFrameworkEvent_1.BotFrameworkEvent(msg, context, stateData, this.storage, intent);
            event.applicationId = this.applicationId;
            event.applicationPassword = this.applicationPassword;
            if (!event.request.locale) {
                event.request.locale = this.config.defaultLocale;
            }
            const reply = yield this.app.execute(event, new BotFrameworkReply_1.BotFrameworkReply(event));
            yield reply.send(event);
            return {};
        });
    }
    recognize(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { intents, entities } = yield new Promise((resolve, reject) => {
                if (msg.text) {
                    return botbuilder_1.LuisRecognizer.recognize(msg.text, this.config.recognizerURI, (err, recognizedIntents, recognizedEntities) => {
                        if (err) {
                            return reject(err);
                        }
                        botframeworklog("Luis.ai response", { intents: recognizedIntents, entities: recognizedEntities });
                        resolve({ intents: recognizedIntents, entities: recognizedEntities });
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
    getStateData(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event.address.conversation) {
                throw new Error("Missing conversation address");
            }
            const conversationId = encodeURIComponent(event.address.conversation.id);
            const userId = event.address.bot.id;
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
                    botframeworklog("got stateData");
                    botframeworklog(result, context);
                    return resolve(result);
                });
            });
        });
    }
}
exports.BotFrameworkPlatform = BotFrameworkPlatform;
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
function prepIncomingMessage(msg) {
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
exports.prepIncomingMessage = prepIncomingMessage;
//# sourceMappingURL=BotFrameworkPlatform.js.map