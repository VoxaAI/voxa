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
const interfaces_1 = require("./interfaces");
function List(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        let listSelect;
        if (_.isString(templatePath)) {
            listSelect = yield reply.render(templatePath);
        }
        else {
            listSelect = templatePath;
        }
        reply.response.directives.push({
            possibleIntents: {
                inputValueData: {
                    "@type": interfaces_1.InputValueDataTypes.OPTION,
                    listSelect,
                },
                intent: interfaces_1.StandardIntents.OPTION,
            },
            type: "possibleIntents",
        });
    });
}
exports.List = List;
function Carousel(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        let carouselSelect;
        if (_.isString(templatePath)) {
            carouselSelect = yield reply.render(templatePath);
        }
        else {
            carouselSelect = templatePath;
        }
        reply.response.directives.push({
            systemIntent: {
                intent: interfaces_1.StandardIntents.OPTION,
                spec: {
                    optionValueSpec: {
                        carouselSelect,
                    },
                },
            },
            type: "systemIntent",
        });
    });
}
exports.Carousel = Carousel;
function Suggestions(suggestions) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        if (_.isString(suggestions)) {
            suggestions = yield reply.render(suggestions);
        }
        reply.response.directives.push({ suggestions, type: "suggestions" });
    });
}
exports.Suggestions = Suggestions;
function BasicCard(templatePath) {
    return (reply, event) => __awaiter(this, void 0, void 0, function* () {
        let basicCard;
        if (_.isString(templatePath)) {
            basicCard = yield reply.render(templatePath);
        }
        else {
            basicCard = templatePath;
        }
        reply.response.directives.push({ basicCard, type: "basicCard" });
    });
}
exports.BasicCard = BasicCard;
//# sourceMappingURL=directives.js.map