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
const actions_on_google_1 = require("actions-on-google");
const _ = require("lodash");
class List {
    constructor(listOptions) {
        this.listOptions = listOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
                return;
            }
            let listSelect;
            if (_.isString(this.listOptions)) {
                listSelect = new actions_on_google_1.List(yield event.renderer.renderPath(this.listOptions, event));
            }
            else {
                listSelect = new actions_on_google_1.List(this.listOptions);
            }
            const google = reply.payload.google;
            google.systemIntent = {
                data: listSelect.inputValueData,
                intent: listSelect.intent,
            };
        });
    }
}
List.platform = "dialogFlow";
List.key = "dialogFlowList";
exports.List = List;
class Carousel {
    constructor(carouselOptions) {
        this.carouselOptions = carouselOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
                return;
            }
            let carouselSelect;
            if (_.isString(this.carouselOptions)) {
                carouselSelect = new actions_on_google_1.Carousel(yield event.renderer.renderPath(this.carouselOptions, event));
            }
            else {
                carouselSelect = new actions_on_google_1.Carousel(this.carouselOptions);
            }
            const google = reply.payload.google;
            google.systemIntent = {
                data: carouselSelect.inputValueData,
                intent: carouselSelect.intent,
            };
        });
    }
}
Carousel.platform = "dialogFlow";
Carousel.key = "dialogFlowCarousel";
exports.Carousel = Carousel;
class Suggestions {
    constructor(suggestions) {
        this.suggestions = suggestions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const suggestions = new actions_on_google_1.Suggestions(this.suggestions);
            const richResponse = _.get(reply, "payload.google.richResponse", new actions_on_google_1.RichResponse());
            reply.payload.google.richResponse = richResponse.addSuggestion(suggestions);
        });
    }
}
Suggestions.platform = "dialogFlow";
Suggestions.key = "dialogFlowSuggestions";
exports.Suggestions = Suggestions;
class BasicCard {
    constructor(viewPath) {
        if (_.isString(viewPath)) {
            this.viewPath = viewPath;
        }
        else {
            this.basicCardOptions = viewPath;
        }
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
                return;
            }
            let basicCard;
            if (this.viewPath) {
                basicCard = new actions_on_google_1.BasicCard(yield event.renderer.renderPath(this.viewPath, event));
            }
            else if (this.basicCardOptions) {
                basicCard = new actions_on_google_1.BasicCard(this.basicCardOptions);
            }
            const richResponse = _.get(reply, "payload.google.richResponse", new actions_on_google_1.RichResponse());
            reply.payload.google.richResponse = richResponse.add(basicCard);
        });
    }
}
BasicCard.platform = "dialogFlow";
BasicCard.key = "dialogFlowBasicCard";
exports.BasicCard = BasicCard;
class AccountLinkingCard {
    constructor(context) {
        this.context = context;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            reply.fulfillmentText = "login";
            const signIn = new actions_on_google_1.SignIn(this.context);
            const google = reply.payload.google;
            google.systemIntent = {
                data: signIn.inputValueData,
                intent: signIn.intent,
            };
        });
    }
}
AccountLinkingCard.platform = "dialogFlow";
AccountLinkingCard.key = "dialogFlowAccountLinkingCard";
exports.AccountLinkingCard = AccountLinkingCard;
class MediaResponse {
    constructor(mediaObject) {
        this.mediaObject = mediaObject;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogFlowEvent = event;
            if (!_.includes(dialogFlowEvent.supportedInterfaces, "actions.capability.AUDIO_OUTPUT")) {
                return;
            }
            const mediaResponse = new actions_on_google_1.MediaResponse(this.mediaObject);
            const richResponse = _.get(reply, "payload.google.richResponse", new actions_on_google_1.RichResponse());
            if (richResponse.items.length === 0) {
                throw new Error("MediaResponse requires another simple response first");
            }
            reply.payload.google.richResponse = richResponse.add(mediaResponse);
        });
    }
}
MediaResponse.platform = "dialogFlow";
MediaResponse.key = "dialogFlowMediaResponse";
exports.MediaResponse = MediaResponse;
class Permission {
    constructor(permissionOptions) {
        this.permissionOptions = permissionOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            reply.fulfillmentText = "login";
            const permission = new actions_on_google_1.Permission(this.permissionOptions);
            const google = reply.payload.google;
            google.systemIntent = {
                data: permission.inputValueData,
                intent: permission.intent,
            };
        });
    }
}
Permission.platform = "dialogFlow";
Permission.key = "dialogFlowPermission";
exports.Permission = Permission;
class DateTime {
    constructor(dateTimeOptions) {
        this.dateTimeOptions = dateTimeOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const dateTime = new actions_on_google_1.DateTime(this.dateTimeOptions);
            google.systemIntent = {
                data: dateTime.inputValueData,
                intent: dateTime.intent,
            };
        });
    }
}
DateTime.platform = "dialogFlow";
DateTime.key = "dialogFlowDateTime";
exports.DateTime = DateTime;
class Confirmation {
    constructor(prompt) {
        this.prompt = prompt;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const confirmation = new actions_on_google_1.Confirmation(this.prompt);
            google.systemIntent = {
                data: confirmation.inputValueData,
                intent: confirmation.intent,
            };
        });
    }
}
Confirmation.platform = "dialogFlow";
Confirmation.key = "dialogFlowConfirmation";
exports.Confirmation = Confirmation;
class DeepLink {
    constructor(deepLinkOptions) {
        this.deepLinkOptions = deepLinkOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const deepLink = new actions_on_google_1.DeepLink(this.deepLinkOptions);
            google.systemIntent = {
                data: deepLink.inputValueData,
                intent: deepLink.intent,
            };
        });
    }
}
DeepLink.platform = "dialogFlow";
DeepLink.key = "dialogFlowDeepLink";
exports.DeepLink = DeepLink;
class Place {
    constructor(placeOptions) {
        this.placeOptions = placeOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const place = new actions_on_google_1.Place(this.placeOptions);
            google.systemIntent = {
                data: place.inputValueData,
                intent: place.intent,
            };
        });
    }
}
Place.platform = "dialogFlow";
Place.key = "dialogFlowPlace";
exports.Place = Place;
class TransactionDecision {
    constructor(transactionDecisionOptions) {
        this.transactionDecisionOptions = transactionDecisionOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const transactionDecision = new actions_on_google_1.TransactionDecision(this.transactionDecisionOptions);
            google.systemIntent = {
                data: transactionDecision.inputValueData,
                intent: transactionDecision.intent,
            };
        });
    }
}
TransactionDecision.platform = "dialogFlow";
TransactionDecision.key = "dialogFlowTransactionDecision";
exports.TransactionDecision = TransactionDecision;
class TransactionRequirements {
    constructor(transactionRequirementsOptions) {
        this.transactionRequirementsOptions = transactionRequirementsOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const transactionRequirements = new actions_on_google_1.TransactionRequirements(this.transactionRequirementsOptions);
            google.systemIntent = {
                data: transactionRequirements.inputValueData,
                intent: transactionRequirements.intent,
            };
        });
    }
}
TransactionRequirements.platform = "dialogFlow";
TransactionRequirements.key = "dialogFlowTransactionRequirements";
exports.TransactionRequirements = TransactionRequirements;
class RegisterUpdate {
    constructor(registerUpdateOptions) {
        this.registerUpdateOptions = registerUpdateOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const registerUpdate = new actions_on_google_1.RegisterUpdate(this.registerUpdateOptions);
            google.systemIntent = {
                data: registerUpdate.inputValueData,
                intent: registerUpdate.intent,
            };
        });
    }
}
RegisterUpdate.platform = "dialogFlow";
RegisterUpdate.key = "dialogFlowRegisterUpdate";
exports.RegisterUpdate = RegisterUpdate;
class UpdatePermission {
    constructor(updatePermissionOptions) {
        this.updatePermissionOptions = updatePermissionOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const updatePermission = new actions_on_google_1.UpdatePermission(this.updatePermissionOptions);
            google.systemIntent = {
                data: updatePermission.inputValueData,
                intent: updatePermission.intent,
            };
        });
    }
}
UpdatePermission.platform = "dialogFlow";
UpdatePermission.key = "dialogFlowUpdatePermission";
exports.UpdatePermission = UpdatePermission;
class Table {
    constructor(tableOptions) {
        this.tableOptions = tableOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
                return;
            }
            const google = reply.payload.google;
            const table = new actions_on_google_1.Table(this.tableOptions);
            const richResponse = _.get(reply, "payload.google.richResponse", new actions_on_google_1.RichResponse());
            reply.payload.google.richResponse = richResponse.add(table);
        });
    }
}
Table.platform = "dialogFlow";
Table.key = "dialogFlowTable";
exports.Table = Table;
class BrowseCarousel {
    constructor(browseCarouselOptions) {
        this.browseCarouselOptions = browseCarouselOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
                return;
            }
            const google = reply.payload.google;
            const browseCarousel = new actions_on_google_1.BrowseCarousel(this.browseCarouselOptions);
            const richResponse = _.get(reply, "payload.google.richResponse", new actions_on_google_1.RichResponse());
            reply.payload.google.richResponse = richResponse.add(browseCarousel);
        });
    }
}
BrowseCarousel.platform = "dialogFlow";
BrowseCarousel.key = "dialogFlowBrowseCarousel";
exports.BrowseCarousel = BrowseCarousel;
class NewSurface {
    constructor(newSurfaceOptions) {
        this.newSurfaceOptions = newSurfaceOptions;
    }
    writeToReply(reply, event, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const google = reply.payload.google;
            const newSurface = new actions_on_google_1.NewSurface(this.newSurfaceOptions);
            google.systemIntent = {
                data: newSurface.inputValueData,
                intent: newSurface.intent,
            };
        });
    }
}
NewSurface.platform = "dialogFlow";
NewSurface.key = "dialogFlowNewSurface";
exports.NewSurface = NewSurface;
//# sourceMappingURL=directives.js.map