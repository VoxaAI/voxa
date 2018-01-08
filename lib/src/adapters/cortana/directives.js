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
const _ = require("lodash");
function HeroCard(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        let attachment;
        if (_.isString(templatePath)) {
            attachment = yield reply.render(templatePath);
        }
        else {
            attachment = templatePath;
        }
        reply.response.directives.push({ type: "attachment", attachment });
    });
}
exports.HeroCard = HeroCard;
function SuggestedActions(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        let suggestedActions;
        if (_.isString(templatePath)) {
            suggestedActions = yield reply.render(templatePath);
        }
        else {
            suggestedActions = templatePath;
        }
        reply.response.directives.push({ type: "suggestedActions", suggestedActions });
    });
}
exports.SuggestedActions = SuggestedActions;
//# sourceMappingURL=directives.js.map