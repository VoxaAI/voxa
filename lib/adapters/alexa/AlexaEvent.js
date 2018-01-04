"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const AlexaIntent_1 = require("./AlexaIntent");
class AlexaEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(event, context) {
        super(event, context);
        this.session = event.session;
        this.request = event.request;
        this.context = event.context;
        this.executionContext = context;
        this.rawEvent = event;
        if (_.isEmpty(_.get(this, "session.attributes"))) {
            _.set(this, "session.attributes", {});
        }
        if (_.get(event, "request.type") === "LaunchRequest") {
            this.intent = new AlexaIntent_1.AlexaIntent({ name: "LaunchIntent", slots: {} });
            this.request.type = "IntentRequest";
        }
        else if (_.get(event, "request.type") === "Display.ElementSelected") {
            this.intent = new AlexaIntent_1.AlexaIntent({ name: "DisplayElementSelected", slots: {} });
            this.request.type = "IntentRequest";
        }
        else {
            this.intent = new AlexaIntent_1.AlexaIntent(this.request.intent);
        }
        this.type = "alexa";
    }
    get user() {
        return _.get(this, "session.user") || _.get(this, "context.System.user");
    }
    get token() {
        return _.get(this, "request.token");
    }
}
exports.AlexaEvent = AlexaEvent;
//# sourceMappingURL=AlexaEvent.js.map