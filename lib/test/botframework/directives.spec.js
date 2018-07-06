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
require("mocha");
const botbuilder_azure_1 = require("botbuilder-azure");
const chai_1 = require("chai");
const i18n = require("i18next");
const _ = require("lodash");
const simple = require("simple-mock");
const BotFrameworkPlatform_1 = require("../../src/platforms/botframework/BotFrameworkPlatform");
const BotFrameworkReply_1 = require("../../src/platforms/botframework/BotFrameworkReply");
const VoxaApp_1 = require("../../src/VoxaApp");
const views_1 = require("../views");
describe("BotFramework directives", () => {
    let event;
    let app;
    let botFrameworkSkill;
    let storage;
    let azureTableClient;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    afterEach(() => {
        simple.restore();
    });
    beforeEach(() => {
        app = new VoxaApp_1.VoxaApp({ views: views_1.views });
        azureTableClient = new botbuilder_azure_1.AzureTableClient("", "", "");
        storage = new botbuilder_azure_1.AzureBotStorage({ gzipData: false }, azureTableClient);
        botFrameworkSkill = new BotFrameworkPlatform_1.BotFrameworkPlatform(app, {
            storage,
        });
        event = _.cloneDeep(require("../requests/botframework/microsoft.launch.json"));
        simple.mock(storage, "getData")
            .callbackWith(null, {});
        simple.mock(storage, "saveData")
            .callbackWith(null, {});
        simple.mock(BotFrameworkReply_1.BotFrameworkReply.prototype, "getAuthorization")
            .resolveWith({ access_token: "123" });
        simple.mock(BotFrameworkReply_1.BotFrameworkReply.prototype, "botApiRequest")
            .resolveWith({});
    });
    describe("AudioCard", () => {
        it("should render an AudioCard with an url", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                botframeworkAudioCard: "http://example.com",
                to: "die",
            });
            yield botFrameworkSkill.execute(event, {});
            const mock = BotFrameworkReply_1.BotFrameworkReply.prototype.botApiRequest;
            chai_1.expect(mock.called).to.be.true;
            chai_1.expect(mock.callCount).to.equal(1);
            const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
            chai_1.expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
                attachments: [{
                        content: {
                            media: [
                                {
                                    profile: "",
                                    url: "http://example.com",
                                },
                            ],
                        },
                        contentType: "application/vnd.microsoft.card.audio",
                    }],
                channelId: "cortana",
                conversation: {
                    id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
                },
                from: {
                    id: "tide",
                },
                inputHint: "acceptingInput",
                locale: "en-US",
                recipient: {
                    id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
                },
                replyToId: "4Cq2PVQFeti",
                speak: "",
                text: "",
                textFormat: "plain",
                type: "message",
            });
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map