"use strict";
/**
 * Voxa Reply
 *
 * See message-renderer to see the response structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
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
const debug = require("debug");
const _ = require("lodash");
const log = debug("voxa");
class VoxaReply {
    constructor(voxaEvent, renderer) {
        this.voxaEvent = voxaEvent;
        this.session = voxaEvent.session;
        this.directiveHandlers = [];
        this.renderer = renderer;
        this.response = {
            directives: [],
            reprompt: "",
            statements: [],
            terminate: true,
            yield: false,
        };
        _.map([ask, askP, tell, tellP, say, sayP, reprompt, directives, reply], (handler) => this.registerDirectiveHandler(handler, handler.name));
    }
    render(templatePath, variables) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.renderer.renderPath(templatePath, this.voxaEvent, variables);
        });
    }
    addStatement(statement) {
        if (this.isYielding()) {
            throw new Error("Can't append to already yielding response");
        }
        this.response.statements.push(statement);
    }
    registerDirectiveHandler(handler, key) {
        this.directiveHandlers.push({ handler, key });
    }
    get hasMessages() {
        return this.response.statements.length > 0;
    }
    get hasDirectives() {
        return this.response.directives.length > 0;
    }
    clear() {
        this.response.reprompt = "";
        this.response.statements = [];
        this.response.directives = [];
    }
    yield() {
        this.response.yield = true;
        return this;
    }
    hasDirective(type) {
        return this.response.directives.some((directive) => {
            if (_.isRegExp(type)) {
                return !!type.exec(directive.type);
            }
            if (_.isString(type)) {
                return type === directive.type;
            }
            if (_.isFunction(type)) {
                return type(directive);
            }
            throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
        });
    }
    isYielding() {
        return this.response.yield;
    }
}
exports.VoxaReply = VoxaReply;
function reply(templatePaths) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        if (!_.isArray(templatePaths)) {
            templatePaths = [templatePaths];
        }
        yield bluebird.map(templatePaths, (tp) => __awaiter(this, void 0, void 0, function* () {
            const message = yield response.render(tp);
            if (message.ask) {
                response.addStatement(message.ask);
                response.response.terminate = false;
                response.yield();
            }
            else if (message.tell) {
                response.addStatement(message.tell);
                response.yield();
            }
            else if (message.say) {
                response.addStatement(message.say);
                response.response.terminate = false;
            }
            if (message.reprompt) {
                response.response.reprompt = message.reprompt;
            }
            if (message.directives) {
                yield bluebird.map(_.filter(message.directives), (fn) => {
                    return fn(response, event);
                });
            }
        }));
    });
}
exports.reply = reply;
function ask(templatePath) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield response.render(templatePath);
        return yield askP(statement)(response, event);
    });
}
exports.ask = ask;
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
        response.response.reprompt = statement;
    });
}
exports.reprompt = reprompt;
function directives(functions) {
    return (response, event) => __awaiter(this, void 0, void 0, function* () {
        yield bluebird.map(functions, (fn) => fn(response, event));
    });
}
exports.directives = directives;
//# sourceMappingURL=VoxaReply.js.map