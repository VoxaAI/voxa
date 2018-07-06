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
const botbuilder_azure_1 = require("botbuilder-azure");
const chai_1 = require("chai");
const _ = require("lodash");
const simple = require("simple-mock");
const BotFrameworkPlatform_1 = require("../../src/platforms/botframework/BotFrameworkPlatform");
const VoxaApp_1 = require("../../src/VoxaApp");
const tools_1 = require("../tools");
const variables_1 = require("../variables");
const views_1 = require("../views");
describe("BotFrameworkPlatform", () => {
    let platform;
    let app;
    let storage;
    let azureTableClient;
    afterEach(() => {
        simple.restore();
    });
    beforeEach(() => {
        app = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
        azureTableClient = new botbuilder_azure_1.AzureTableClient("", "", "");
        storage = new botbuilder_azure_1.AzureBotStorage({ gzipData: false }, azureTableClient);
        // we need to mock this before instantiating the platforms cause otherwise
        // we try to get the authorization token
        platform = new BotFrameworkPlatform_1.BotFrameworkPlatform(app, { recognizer: botbuilder_1.LuisRecognizer, storage });
        simple.mock(storage, "getData")
            .callbackWith(null, {});
        simple.mock(storage, "saveData")
            .callbackWith(null, {});
        simple.mock(platform, "botApiRequest")
            .resolveWith(true);
    });
    describe("recognize", () => {
        it("should return undefined on empty recognizer response", () => __awaiter(this, void 0, void 0, function* () {
            simple.mock(botbuilder_1.LuisRecognizer, "recognize").callbackWith(null, undefined, undefined);
            const rawEvent = _.cloneDeep(require("../requests/botframework/StaintIntent.json"));
            const recognizerResponse = yield platform.recognize(rawEvent);
            chai_1.expect(recognizerResponse).to.be.undefined;
        }));
        it("should return the highest scoring intent on a recognizer response", () => __awaiter(this, void 0, void 0, function* () {
            const luisResponse = _.cloneDeep(require("../requests/botframework/luis.json"));
            simple.mock(botbuilder_1.LuisRecognizer, "recognize").callbackWith(null, luisResponse.intents, luisResponse.entities);
            const rawEvent = _.cloneDeep(require("../requests/botframework/StaintIntent.json"));
            const recognizerResponse = yield platform.recognize(rawEvent);
            chai_1.expect(recognizerResponse).to.not.be.undefined;
        }));
    });
    describe("lambdaHTTP", () => {
        it("should return CORS and other headers", () => __awaiter(this, void 0, void 0, function* () {
            /* tslint:disable */
            const ALLOWED_HEADERS = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-ms-client-session-id,x-ms-client-request-id,x-ms-effective-locale";
            /* tslint:enable */
            const event = tools_1.getAPIGatewayProxyEvent();
            const callback = (err, result) => {
                if (err) {
                    throw err;
                }
                chai_1.expect(result.headers["Access-Control-Allow-Headers"]).to.equal(ALLOWED_HEADERS);
            };
            const context = tools_1.getLambdaContext(callback);
            yield platform.lambdaHTTP()(event, context, callback);
        }));
    });
});
//# sourceMappingURL=BotFrameworkPlatform.spec.js.map