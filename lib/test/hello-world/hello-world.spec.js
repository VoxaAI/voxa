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
const virtual_alexa_1 = require("virtual-alexa");
/* tslint:disable-next-line:no-var-requires */
const views = require("./views.json");
describe("Hello World", () => {
    describe("Alexa", () => {
        let alexa;
        beforeEach(() => {
            alexa = virtual_alexa_1.VirtualAlexa.Builder()
                .handler("test/hello-world/hello-world.alexaHandler") // Lambda function file and name
                .interactionModelFile("./test/hello-world/alexa-model.json")
                .create();
        });
        it("Runs the alexa skill and like\'s voxa", () => __awaiter(this, void 0, void 0, function* () {
            let reply = yield alexa.launch();
            chai_1.expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");
            reply = yield alexa.utter("yes");
            chai_1.expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesLikeVoxa);
        }));
        it("Runs the alexa skill and does not like voxa", () => __awaiter(this, void 0, void 0, function* () {
            let reply = yield alexa.launch();
            chai_1.expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");
            reply = yield alexa.utter("no");
            chai_1.expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesNotLikeVoxa);
        }));
    });
});
//# sourceMappingURL=hello-world.spec.js.map