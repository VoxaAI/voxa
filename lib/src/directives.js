"use strict";
/*
 * Directives are functions that apply changes on the reply object. They can be registered as keys on the voxa
 * application and then used on transitions
 *
 * For example, the reply directive is used as part of the transition to render ask, say, tell, reprompt or directives.
 *
 * return { reply: 'View' }
 */
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
function reply(templatePaths) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        if (!_.isArray(templatePaths)) {
            templatePaths = [templatePaths];
        }
        yield bluebird.map(templatePaths, (tp) => __awaiter(this, void 0, void 0, function* () {
            const message = yield response.render(tp);
            if (message.ask) {
                yield askP(message.ask)(response, event);
            }
            if (message.tell) {
                yield tellP(message.tell)(response, event);
            }
            if (message.say) {
                yield sayP(message.say)(response, event);
            }
            if (message.reprompt) {
                yield repromptP(message.reprompt)(response, event);
            }
            if (message.directives) {
                yield directives(message.directives)(response, event);
            }
        }));
    });
}
exports.reply = reply;
/*
 * Takes a template path and renders it, then adds it to the reply as an ask statement
 */
function ask(templatePath) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield response.render(templatePath);
        return yield askP(statement)(response, event);
    });
}
exports.ask = ask;
/*
 * Plain version of ask, takes an statement and adds it directly to the reply without
 * rendering it first
 */
function askP(statement) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        response.addStatement(statement);
        response.response.terminate = false;
        response.yield();
    });
}
exports.askP = askP;
function tell(templatePath) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield response.render(templatePath);
        return yield tellP(statement)(response, event);
    });
}
exports.tell = tell;
function tellP(statement) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        response.addStatement(statement);
        response.yield();
    });
}
exports.tellP = tellP;
function say(templatePath) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield response.render(templatePath);
        return yield sayP(statement)(response, event);
    });
}
exports.say = say;
function sayP(statement) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        response.addStatement(statement);
        response.response.terminate = false;
    });
}
exports.sayP = sayP;
function reprompt(templatePath) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield response.render(templatePath);
        return yield repromptP(statement)(response, event);
    });
}
exports.reprompt = reprompt;
function repromptP(statement) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        response.response.reprompt = statement;
    });
}
exports.repromptP = repromptP;
function directives(functions) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        yield bluebird.map(functions, (fn) => fn(response, event));
    });
}
exports.directives = directives;
//# sourceMappingURL=directives.js.map