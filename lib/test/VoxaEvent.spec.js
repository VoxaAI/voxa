"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Promise.resolve().then(() => require("mocha"));
const chai_1 = require("chai");
const VoxaEvent_1 = require("../src/VoxaEvent");
class Event extends VoxaEvent_1.IVoxaEvent {
    constructor(raw, context) {
        super(raw, context);
        this.requestToIntent = {
            LaunchRequest: "LaunchIntent",
        };
        this.requestToRequest = {
            CiaoRequest: "SessionEndedRequest",
        };
        this.request = raw.request;
    }
    get supportedInterfaces() {
        return [];
    }
}
describe("VoxaEvent", () => {
    it("should map some requests to intents", () => {
        const raw = {
            request: {
                type: "LaunchRequest",
            },
        };
        const event = new Event(raw, {});
        event.mapRequestToIntent();
        chai_1.expect(event.request.type).to.equal("IntentRequest");
        if (!event.intent) {
            throw new Error("event.intent is undefined");
        }
        chai_1.expect(event.intent.name).to.equal("LaunchIntent");
    });
    it("should not map requests to intents if not specified", () => {
        const raw = {
            request: {
                type: "ExitRequest",
            },
        };
        const event = new Event(raw, {});
        event.mapRequestToIntent();
        chai_1.expect(event.request.type).to.equal("ExitRequest");
        chai_1.expect(event.intent).to.be.undefined;
    });
    it("should map requests to other requests if specified", () => {
        const raw = {
            request: {
                type: "CiaoRequest",
            },
        };
        const event = new Event(raw, {});
        event.mapRequestToRequest();
        chai_1.expect(event.request.type).to.equal("SessionEndedRequest");
    });
    it("should map requests to other requests if specified", () => {
        const raw = {
            request: {
                type: "ExitRequest",
            },
        };
        const event = new Event(raw, {});
        event.mapRequestToRequest();
        chai_1.expect(event.request.type).to.equal("ExitRequest");
    });
});
//# sourceMappingURL=VoxaEvent.spec.js.map