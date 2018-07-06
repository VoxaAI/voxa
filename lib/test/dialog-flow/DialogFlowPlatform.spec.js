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
const chai_1 = require("chai");
const Voxa = require("../../src/main");
const DialogFlowPlatform_1 = require("../../src/platforms/dialog-flow/DialogFlowPlatform");
const VoxaApp_1 = require("../../src/VoxaApp");
const views_1 = require("../views");
describe("DialogFlowPlatform", () => {
    describe("execute", () => {
        it("should convert the voxaReply to a Dialog Flow response", () => __awaiter(this, void 0, void 0, function* () {
            const rawEvent = require("../requests/dialog-flow/launchIntent.json");
            const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views });
            voxaApp.onIntent("LaunchIntent", () => ({ say: "LaunchIntent.OpenResponse" }));
            const platform = new DialogFlowPlatform_1.DialogFlowPlatform(voxaApp);
            const reply = yield platform.execute(rawEvent, {});
            chai_1.expect(reply.speech).to.equal("<speak>Hello from DialogFlow</speak>");
        }));
        it("should not close the session on Help Intent", () => __awaiter(this, void 0, void 0, function* () {
            const rawEvent = require("../requests/dialog-flow/helpIntent.json");
            const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views });
            voxaApp.onIntent("HelpIntent", {
                ask: "Help",
                to: "entry",
            });
            const alexaSkill = new Voxa.AlexaPlatform(voxaApp);
            const platform = new Voxa.DialogFlowPlatform(voxaApp);
            const reply = yield platform.execute(rawEvent, {});
            chai_1.expect(reply.speech).to.equal("<speak>This is the help</speak>");
            chai_1.expect(reply.payload.google.expectUserResponse).to.be.true;
        }));
    });
});
//# sourceMappingURL=DialogFlowPlatform.spec.js.map