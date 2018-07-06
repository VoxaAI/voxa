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
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const log = debug("voxa");
function addToSSML(ssml, statement) {
    const base = ssml.replace(/^<speak>(.*)<\/speak>$/g, "$1");
    if (!base) {
        return `<speak>${statement}</speak>`;
    }
    return `<speak>${base}\n${statement}</speak>`;
}
exports.addToSSML = addToSSML;
function addToText(text, statement) {
    if (!text) {
        return statement;
    }
    return `${text} ${statement}`;
}
exports.addToText = addToText;
//# sourceMappingURL=VoxaReply.js.map