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
const VoxaPlatform_1 = require("../VoxaPlatform");
const DialogFlowEvent_1 = require("./DialogFlowEvent");
const DialogFlowReply_1 = require("./DialogFlowReply");
const directives_1 = require("./directives");
class DialogFlowPlatform extends VoxaPlatform_1.VoxaPlatform {
    execute(rawEvent, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new DialogFlowEvent_1.DialogFlowEvent(rawEvent, context);
            const dialogFlowReply = new DialogFlowReply_1.DialogFlowReply();
            const voxaReply = yield this.app.execute(event, dialogFlowReply);
            return voxaReply;
        });
    }
    getDirectiveHandlers() {
        return [
            directives_1.AccountLinkingCard,
            directives_1.BasicCard,
            directives_1.Carousel,
            directives_1.Confirmation,
            directives_1.DateTime,
            directives_1.DeepLink,
            directives_1.List,
            directives_1.MediaResponse,
            directives_1.Permission,
            directives_1.NewSurface,
            directives_1.Place,
            directives_1.RegisterUpdate,
            directives_1.Suggestions,
            directives_1.Table,
            directives_1.TransactionDecision,
            directives_1.TransactionRequirements,
            directives_1.UpdatePermission,
        ];
    }
}
exports.DialogFlowPlatform = DialogFlowPlatform;
//# sourceMappingURL=DialogFlowPlatform.js.map