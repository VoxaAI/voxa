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
class Reply {
    constructor(viewPaths) {
        this.viewPaths = viewPaths;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let viewPaths = this.viewPaths;
            if (!_.isArray(viewPaths)) {
                viewPaths = [viewPaths];
            }
            yield bluebird.map(viewPaths, (viewPath) => __awaiter(this, void 0, void 0, function* () {
                const message = yield event.renderer.renderPath(viewPath, event);
                if (message.say) {
                    yield new SayP(message.say).writeToReply(reply, event, transition);
                }
                if (message.ask) {
                    reply.addStatement(message.ask);
                    transition.flow = "yield";
                }
                if (message.tell) {
                    reply.addStatement(message.tell);
                    reply.terminate();
                    transition.flow = "terminate";
                }
                if (message.reprompt) {
                    reply.addReprompt(message.reprompt);
                }
                if (message.directives) {
                    if (transition.directives) {
                        transition.directives = transition.directives.concat(message.directives);
                    }
                    else {
                        transition.directives = message.directives;
                    }
                }
            }));
        });
    }
}
Reply.key = "reply";
Reply.platform = "core";
exports.Reply = Reply;
class Reprompt {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const statement = yield event.renderer.renderPath(this.viewPath, event);
            reply.addReprompt(statement);
        });
    }
}
Reprompt.key = "reprompt";
Reprompt.platform = "core";
exports.Reprompt = Reprompt;
class Ask {
    constructor(viewPaths) {
        this.viewPaths = _.isString(viewPaths) ? [viewPaths] : viewPaths;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const viewPath of this.viewPaths) {
                const statement = yield event.renderer.renderPath(viewPath, event);
                if (_.isString(statement)) {
                    reply.addStatement(statement);
                }
                else if (statement.ask) {
                    reply.addStatement(statement.ask);
                    if (statement.reprompt) {
                        reply.addReprompt(statement.reprompt);
                    }
                }
            }
            transition.flow = "yield";
            transition.say = this.viewPaths;
        });
    }
}
Ask.key = "ask";
Ask.platform = "core";
exports.Ask = Ask;
class Say {
    constructor(viewPaths) {
        this.viewPaths = viewPaths;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let viewPaths = this.viewPaths;
            if (_.isString(viewPaths)) {
                viewPaths = [viewPaths];
            }
            yield bluebird.mapSeries(viewPaths, (view) => __awaiter(this, void 0, void 0, function* () {
                const statement = yield event.renderer.renderPath(view, event);
                reply.addStatement(statement);
            }));
        });
    }
}
Say.key = "say";
Say.platform = "core";
exports.Say = Say;
class SayP {
    constructor(statements) {
        this.statements = statements;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            let statements = this.statements;
            if (_.isString(statements)) {
                statements = [statements];
            }
            _.map(statements, (s) => reply.addStatement(s));
        });
    }
}
SayP.key = "sayp";
SayP.platform = "core";
exports.SayP = SayP;
class Tell {
    constructor(viewPath) {
        this.viewPath = viewPath;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const statement = yield event.renderer.renderPath(this.viewPath, event);
            reply.addStatement(statement);
            reply.terminate();
            transition.flow = "terminate";
            transition.say = this.viewPath;
        });
    }
}
Tell.key = "tell";
Tell.platform = "core";
exports.Tell = Tell;
//# sourceMappingURL=directives.js.map