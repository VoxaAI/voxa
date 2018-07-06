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
const debug = require("debug");
const _ = require("lodash");
const rp = require("request-promise");
const errors_1 = require("request-promise/errors");
const urljoin = require("url-join");
const uuid = require("uuid");
const errors_2 = require("../../errors");
const VoxaReply_1 = require("../../VoxaReply");
const botframeworklog = debug("voxa:botframework");
class BotFrameworkReply {
    constructor(event) {
        this.speak = "";
        this.text = "";
        this.textFormat = "plain";
        this.type = "message";
        this.channelId = event.rawEvent.address.channelId;
        if (!event.session) {
            throw new Error("event.session is missing");
        }
        this.conversation = { id: event.session.sessionId };
        this.from = { id: event.rawEvent.address.bot.id };
        this.inputHint = "ignoringInput";
        this.locale = event.request.locale;
        if (!event.user) {
            throw new Error("event.user is missing");
        }
        this.recipient = {
            id: event.user.id,
        };
        if (event.user.name) {
            this.recipient.name = event.user.name;
        }
        this.replyToId = event.rawEvent.address.id;
        this.timestamp = new Date().toISOString();
    }
    get hasMessages() {
        return !!this.speak || !!this.text;
    }
    get hasDirectives() {
        return !!this.attachments || !!this.suggestedActions;
    }
    get hasTerminated() {
        return this.inputHint === "acceptingInput";
    }
    clear() {
        this.attachments = undefined;
        this.suggestedActions = undefined;
        this.text = "";
        this.speak = "";
    }
    terminate() {
        this.inputHint = "acceptingInput";
    }
    get speech() {
        if (!this.speak) {
            return "";
        }
        return this.speak;
    }
    addStatement(statement, isPlain = false) {
        if (this.inputHint === "ignoringInput") {
            this.inputHint = "expectingInput";
        }
        if (isPlain) {
            this.text = VoxaReply_1.addToText(this.text, statement);
        }
        else {
            this.speak = VoxaReply_1.addToSSML(this.speak, statement);
        }
    }
    hasDirective(type) {
        throw new errors_2.NotImplementedError("hasDirective");
    }
    addReprompt(reprompt) {
        return;
    }
    send(event) {
        return __awaiter(this, void 0, void 0, function* () {
            botframeworklog("partialReply");
            botframeworklog({
                hasDirectives: this.hasDirectives,
                hasMessages: this.hasMessages,
                sendingPartialReply: !(!this.hasMessages && !this.hasDirectives),
            });
            if (!this.hasMessages && !this.hasDirectives) {
                return;
            }
            const uri = this.getReplyUri(event.rawEvent);
            this.id = uuid.v1();
            yield this.botApiRequest("POST", uri, _.clone(this), event);
            this.clear();
        });
    }
    botApiRequest(method, uri, reply, event, attempts = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let authorization;
            try {
                authorization = yield this.getAuthorization(event.applicationId, event.applicationPassword);
                const requestOptions = {
                    auth: {
                        bearer: authorization.access_token,
                    },
                    body: this,
                    json: true,
                    method,
                    uri,
                };
                botframeworklog("botApiRequest");
                botframeworklog(JSON.stringify(requestOptions, null, 2));
                return rp(requestOptions);
            }
            catch (reason) {
                if (reason instanceof errors_1.StatusCodeError && attempts < 2) {
                    attempts += 1;
                    if (reason.statusCode === 401) {
                        return this.botApiRequest(method, uri, reply, event, attempts);
                    }
                }
                throw reason;
            }
        });
    }
    getReplyUri(event) {
        const address = event.address;
        const baseUri = address.serviceUrl;
        if (!baseUri || !address.conversation) {
            throw new Error("serviceUrl is missing");
        }
        const conversationId = encodeURIComponent(address.conversation.id);
        let path = `/v3/conversations/${conversationId}/activities`;
        if (address.id) {
            path += "/" + encodeURIComponent(address.id);
        }
        return urljoin(baseUri, path);
    }
    getAuthorization(applicationId, applicationPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = {
                form: {
                    client_id: applicationId,
                    client_secret: applicationPassword,
                    grant_type: "client_credentials",
                    scope: "https://api.botframework.com/.default",
                },
                json: true,
                method: "POST",
                url: "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
            };
            botframeworklog("getAuthorization");
            botframeworklog(requestOptions);
            return yield rp(requestOptions);
        });
    }
    saveSession(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const conversationId = event.session.sessionId;
            const userId = event.rawEvent.address.bot.id;
            const context = {
                conversationId,
                persistConversationData: false,
                persistUserData: false,
                userId,
            };
            const storage = event.storage;
            if (!event.model) {
                return;
            }
            const data = {
                conversationData: {},
                // we're only gonna handle private conversation data, this keeps the code small
                // and more importantly it makes it so the programming model is the same between
                // the different platforms
                privateConversationData: yield event.model.serialize(),
                userData: {},
            };
            yield new Promise((resolve, reject) => {
                storage.saveData(context, data, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    botframeworklog("savedStateData");
                    botframeworklog(data, context);
                    return resolve();
                });
            });
        });
    }
}
exports.BotFrameworkReply = BotFrameworkReply;
//# sourceMappingURL=BotFrameworkReply.js.map