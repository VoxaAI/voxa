"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
class AlexaEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(event, context) {
        super(event, context);
        this.session = event.session;
        this.request = event.request;
        this.context = event.context;
        this._context = context;
        this._raw = event;
        if (_.isEmpty(_.get(this, 'session.attributes'))) {
            _.set(this, 'session.attributes', {});
        }
        if (_.get(event, 'request.type') === 'LaunchRequest') {
            this.intent = new Intent({ name: 'LaunchIntent', slots: {} });
            this.request.type = 'IntentRequest';
        }
        else if (_.get(event, 'request.type') === 'Display.ElementSelected') {
            this.intent = new Intent({ name: 'DisplayElementSelected', slots: {} });
            this.request.type = 'IntentRequest';
        }
        else {
            this.intent = new Intent(this.request.intent);
        }
        this.type = 'alexa';
    }
    get user() {
        return _.get(this, 'session.user') || _.get(this, 'context.System.user');
    }
    get token() {
        return _.get(this, 'request.token');
    }
}
exports.AlexaEvent = AlexaEvent;
class Intent {
    constructor(rawIntent) {
        this._raw = rawIntent;
        if (rawIntent) {
            this.name = rawIntent.name.replace(/^AMAZON./, '');
            this.params = _(rawIntent.slots)
                .map((s) => [s.name, s.value])
                .fromPairs()
                .value();
        }
        else {
            this.name = '';
            this.params = {};
        }
    }
}
//# sourceMappingURL=AlexaEvent.js.map