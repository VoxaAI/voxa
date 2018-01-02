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
const bluebird = require("bluebird");
const _ = require("lodash");
class Renderer {
    constructor(config) {
        if (!config.variables) {
            config.variables = {};
        }
        if (!config.views) {
            throw new Error("DefaultRenderer config should include views");
        }
        this.config = config;
    }
    renderPath(view, voxaEvent, variables) {
        return __awaiter(this, void 0, void 0, function* () {
            const locale = _.get(voxaEvent, "request.locale");
            const type = _.get(voxaEvent, "type");
            let message = voxaEvent.t(view, {
                returnObjects: true,
            });
            if (type && message[type]) {
                message = message[type];
            }
            if (_.isString(message) && message === view) {
                throw new Error(`View ${view} for ${locale} locale is missing`);
            }
            return yield this.renderMessage(message, voxaEvent);
        });
    }
    renderMessage(msg, event) {
        /**
         * it makes a deep search for strings that could have a variable on it
         * @param  any statement - can be a string, array, object or any other value
         * @param VoxaEvent voxaEvent
         * @return Promise             Promise with the statement rendered
         * @example
         * // return { Launch: 'Hi, morning', card: { type: 'Standard', title: 'title' ...}}
         * deepSearchRenderVariable({ Launch: 'hi, {time}', card: '{exitCard}' }, voxaEvent);
         */
        const self = this;
        function deepSearchRenderVariable(statement, voxaEvent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_.isObject(statement) && !_.isArray(statement)) {
                    const objPromises = _.chain(statement)
                        .toPairs()
                        .map(_.spread((key, value) => {
                        const isAnOpenResponse = _.includes(["ask", "tell", "say", "reprompt"], key);
                        if (isAnOpenResponse && _.isArray(value)) {
                            return [key, deepSearchRenderVariable(_.sample(value), voxaEvent)];
                        }
                        return [key, deepSearchRenderVariable(value, voxaEvent)];
                    }))
                        .flattenDeep()
                        .value();
                    const result = yield Promise.all(objPromises);
                    return _.chain(result)
                        .chunk(2)
                        .fromPairs()
                        .value();
                }
                if (_.isString(statement)) {
                    return yield self.renderStatement(statement, voxaEvent);
                }
                if (_.isArray(statement)) {
                    return yield bluebird.map(statement, (statementItem) => deepSearchRenderVariable(statementItem, voxaEvent));
                }
                return statement;
            });
        }
        return deepSearchRenderVariable(msg, event);
    }
    renderStatement(statement, voxaEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenRegx = /{([\s\S]+?)}/g;
            _.templateSettings.interpolate = tokenRegx;
            const tokenKeys = _
                .uniq(statement.match(tokenRegx) || [])
                .map((str) => str.substring(1, str.length - 1));
            const qVariables = _(this.config.variables)
                .toPairs()
                .filter((item) => _.includes(tokenKeys, item[0]))
                .map((item) => [item[0], item[1](voxaEvent)])
                .flatten()
                .value();
            try {
                const vars = yield Promise.all(qVariables);
                const data = _(vars).chunk(2).fromPairs().value();
                const dataKeys = _.keys(data);
                const dataValues = _.values(data);
                if (_.isEmpty(statement.replace(tokenRegx, "").trim()) && dataKeys.length === 1) {
                    const singleValue = (_.head(dataValues));
                    return _.isObject(singleValue) ? singleValue : _.template(statement)(data);
                }
                return _.template(statement)(data);
            }
            catch (err) {
                throw new Error(`No such variable in views, ${err}`);
            }
        });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map