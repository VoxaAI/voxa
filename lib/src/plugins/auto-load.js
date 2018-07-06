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
const debug = require("debug");
const _ = require("lodash");
const log = debug("voxa:plugins:autoload");
let defaultConfig = {};
function autoLoad(skill, config) {
    if (!config) {
        throw Error("Missing config object");
    }
    if (!config.adapter) {
        throw Error("Missing adapter");
    }
    if (!_.isFunction(config.adapter.get)) {
        throw Error("No get method to fetch data from");
    }
    defaultConfig = _.merge(defaultConfig, config);
    skill.onSessionStarted((voxaEvent) => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield defaultConfig.adapter.get(voxaEvent.user);
            log("Data fetched:");
            log(data);
            voxaEvent.model.user = data;
            return voxaEvent;
        }
        catch (error) {
            log(`Error getting data: ${error}`);
            throw error;
        }
    }));
}
exports.autoLoad = autoLoad;
//# sourceMappingURL=auto-load.js.map