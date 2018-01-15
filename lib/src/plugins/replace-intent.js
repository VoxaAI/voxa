"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var defaultConfig = {
    regex: /(.*)OnlyIntent$/,
    replace: "$1Intent",
};
function register(app, config) {
    var pluginConfig = _.merge({}, defaultConfig, config);
    app.onIntentRequest(function (voxaEvent) {
        if (voxaEvent.intent) {
            var intentName = voxaEvent.intent.name;
            voxaEvent.intent.name = intentName.replace(pluginConfig.regex, pluginConfig.replace);
        }
    });
}
exports.register = register;
//# sourceMappingURL=replace-intent.js.map