"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const defaultConfig = {
    regex: /(.*)OnlyIntent$/,
    replace: "$1Intent",
};
function register(app, config) {
    const pluginConfig = _.merge({}, defaultConfig, config);
    app.onIntentRequest((voxaEvent) => {
        if (voxaEvent.intent) {
            const intentName = voxaEvent.intent.name;
            voxaEvent.intent.name = intentName.replace(pluginConfig.regex, pluginConfig.replace);
        }
    });
}
exports.register = register;
//# sourceMappingURL=replace-intent.js.map