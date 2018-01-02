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
const _ = require("lodash");
const debug = require("debug");
const bluebird = require("bluebird");
const log = debug('voxa');
class VoxaReply {
    constructor(voxaEvent, renderer) {
        this.voxaEvent = voxaEvent;
        this.session = voxaEvent.session;
        this.directiveHandlers = [];
        this.renderer = renderer;
        this.response = {
            statements: [],
            reprompt: '',
            yield: false,
            terminate: true,
            directives: [],
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
            throw new Error('Can\'t append to already yielding response');
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
        this.response.reprompt = '';
        this.response.statements = [];
        this.response.directives = [];
    }
    yield() {
        this.response.yield = true;
        return this;
    }
    hasDirective(type) {
        return this.response.directives.some((directive) => {
            if (_.isRegExp(type))
                return !!type.exec(directive.type);
            if (_.isString(type))
                return type === directive.type;
            if (_.isFunction(type))
                return type(directive);
            throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
        });
    }
    isYielding() {
        return this.response.yield;
    }
}
exports.VoxaReply = VoxaReply;
function reply(templatePaths) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (!_.isArray(templatePaths)) {
            templatePaths = [templatePaths];
        }
        return bluebird.map(templatePaths, (tp) => __awaiter(this, void 0, void 0, function* () {
            const message = yield reply.render(tp);
            if (message.ask) {
                reply.addStatement(message.ask);
                reply.response.terminate = false;
                reply.yield();
            }
            else if (message.tell) {
                reply.addStatement(message.tell);
                reply.yield();
            }
            else if (message.say) {
                reply.addStatement(message.say);
                reply.response.terminate = false;
            }
            if (message.reprompt) {
                reply.response.reprompt = message.reprompt;
            }
            if (message.directives) {
                yield bluebird.map(_.filter(message.directives), (fn) => {
                    return fn(reply, event);
                });
            }
        }));
    });
}
exports.reply = reply;
function ask(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield reply.render(templatePath);
        return yield askP(statement)(reply, event);
    });
}
exports.ask = ask;
function askP(statement) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        reply.addStatement(statement);
        reply.response.terminate = false;
        reply.yield();
    });
}
exports.askP = askP;
function tell(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield reply.render(templatePath);
        return yield tellP(statement)(reply, event);
    });
}
exports.tell = tell;
function tellP(statement) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        reply.addStatement(statement);
        reply.yield();
    });
}
exports.tellP = tellP;
function say(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield reply.render(templatePath);
        return yield sayP(statement)(reply, event);
    });
}
exports.say = say;
function sayP(statement) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        reply.addStatement(statement);
        reply.response.terminate = false;
    });
}
exports.sayP = sayP;
function reprompt(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        const statement = yield reply.render(templatePath);
        reply.response.reprompt = statement;
    });
}
exports.reprompt = reprompt;
function directives(functions) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        return yield bluebird.map(functions, fn => fn(reply, event));
    });
}
exports.directives = directives;
//# sourceMappingURL=VoxaReply.js.map