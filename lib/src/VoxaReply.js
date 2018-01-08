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
const debug = require("debug");
const _ = require("lodash");
const log = debug("voxa");
class VoxaReply {
    constructor(voxaEvent, renderer) {
        this.voxaEvent = voxaEvent;
        this.session = voxaEvent.session;
        this.renderer = renderer;
        this.response = {
            directives: [],
            reprompt: "",
            statements: [],
            terminate: true,
            yield: false,
        };
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
//# sourceMappingURL=VoxaReply.js.map