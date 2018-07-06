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
const azure_functions_ts_essentials_1 = require("azure-functions-ts-essentials");
const create_server_1 = require("./create-server");
const log = debug("voxa");
class VoxaPlatform {
    constructor(voxaApp, config = {}) {
        this.app = voxaApp;
        this.config = config;
        _.forEach(this.getDirectiveHandlers(), (directive) => this.app.directiveHandlers.push(directive));
        _.forEach(this.getPlatformRequests(), (requestType) => voxaApp.registerRequestHandler(requestType));
    }
    startServer(port) {
        port = port || 3000;
        create_server_1.createServer(this).listen(port, () => {
            log(`Listening on port ${port}`);
        });
    }
    getDirectiveHandlers() {
        return [];
    }
    getPlatformRequests() {
        return [];
    }
    lambda() {
        return (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
            context.callbackWaitsForEmptyEventLoop = false;
            try {
                const result = yield this.execute(event, context);
                return callback(null, result);
            }
            catch (error) {
                return callback(error);
            }
        });
    }
    lambdaHTTP() {
        return (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
            context.callbackWaitsForEmptyEventLoop = false;
            try {
                const body = JSON.parse(event.body || "");
                const result = yield this.execute(body, context);
                const response = {
                    body: JSON.stringify(result),
                    headers: {
                        "Content-Type": "application/json",
                    },
                    statusCode: 200,
                };
                return callback(null, response);
            }
            catch (error) {
                callback(error);
            }
        });
    }
    azureFunction() {
        return (context, req) => __awaiter(this, void 0, void 0, function* () {
            try {
                let res;
                if (req.method !== azure_functions_ts_essentials_1.HttpMethod.Post) {
                    res = {
                        body: {
                            error: {
                                message: `Method ${req.method} not supported.`,
                                type: "not_supported",
                            },
                        },
                        status: azure_functions_ts_essentials_1.HttpStatusCode.MethodNotAllowed,
                    };
                }
                else {
                    const body = yield this.execute(req.body, {});
                    res = {
                        body,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        status: azure_functions_ts_essentials_1.HttpStatusCode.OK,
                    };
                }
                context.done(undefined, res);
            }
            catch (error) {
                context.done(error);
            }
        });
    }
    onIntent(intentName, handler) {
        this.app.onIntent(intentName, handler, this.platform);
    }
    onState(stateName, handler, intents = []) {
        this.app.onState(stateName, handler, intents, this.platform);
    }
}
exports.VoxaPlatform = VoxaPlatform;
//# sourceMappingURL=VoxaPlatform.js.map