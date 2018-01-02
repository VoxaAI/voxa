"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
class CortanaIntent {
    constructor(message) {
        this._raw = message;
        const intentEntity = _.find(this._raw.entities, { type: 'Intent' });
        if (!intentEntity) {
            this.name = '';
            this.params = {};
        }
        else {
            if (intentEntity.name === 'Microsoft.Launch') {
                this.name = 'LaunchIntent';
                this.params = {};
            }
            else {
                this.name = intentEntity.name || '';
                this.params = {};
            }
        }
    }
}
exports.CortanaIntent = CortanaIntent;
class CortanaEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(message, context, stateData, intent) {
        super(message, context);
        this.type = 'cortana';
        this.session = {
            new: _.isEmpty(stateData.privateConversationData),
            attributes: stateData.privateConversationData || {},
            sessionId: _.get(message, 'address.conversation.id'),
        };
        this.context = {};
        if (intent) {
            this.intent = intent;
        }
        else {
            this.intent = new CortanaIntent(message);
        }
    }
    get user() {
        return _.merge(this._raw.address.user, { userId: this._raw.address.user.id });
    }
    get request() {
        let type = this._raw.type;
        if (type === 'endOfConversation') {
            type = 'SessionEndedRequest';
        }
        if (this.intent && this.intent.name) {
            type = 'IntentRequest';
        }
        var locale;
        if (this._raw.textLocale) {
            locale = this._raw.textLocale;
        }
        if (this._raw.entities) {
            const entity = _(this._raw.entities)
                .filter({ type: 'clientInfo' })
                .filter((e) => !!e.locale)
                .first();
            if (entity) {
                locale = entity.locale;
            }
        }
        return { type, locale };
    }
}
exports.CortanaEvent = CortanaEvent;
function isIConversationUpdate(message) {
    return message.type === 'conversationUpdate';
}
//# sourceMappingURL=CortanaEvent.js.map