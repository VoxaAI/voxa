"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DisplayTemplate = /** @class */ (function () {
    function DisplayTemplate(type) {
        this.type = type;
        this.listItems = [];
        this.backButton = "VISIBLE";
    }
    DisplayTemplate.prototype.setTitle = function (title) {
        this.title = title;
        return this;
    };
    DisplayTemplate.prototype.addItem = function (token, image, text1, text2, text3) {
        var item = {
            image: image ? toImage(image) : undefined,
            textContent: toTextContext(text1, text2, text3),
            token: token,
        };
        this.listItems.push(item);
        return this;
    };
    DisplayTemplate.prototype.setToken = function (token) {
        this.token = token;
        return this;
    };
    DisplayTemplate.prototype.setBackButton = function (state) {
        this.backButton = state;
        return this;
    };
    DisplayTemplate.prototype.setTextContent = function (text1, text2, text3) {
        this.textContent = toTextContext(text1, text2, text3);
        return this;
    };
    DisplayTemplate.prototype.setBackgroundImage = function (backgroundImage) {
        this.backgroundImage = toImage(backgroundImage);
        return this;
    };
    DisplayTemplate.prototype.toJSON = function () {
        return {
            template: {
                backButton: this.backButton,
                backgroundImage: this.backgroundImage,
                listItems: this.listItems.length > 0 ? this.listItems : undefined,
                textContent: this.textContent,
                title: this.title,
                token: this.token,
                type: this.type,
            },
            type: "Display.RenderTemplate",
        };
    };
    return DisplayTemplate;
}());
exports.DisplayTemplate = DisplayTemplate;
function toImage(image, contentDescription) {
    if (contentDescription === void 0) { contentDescription = ""; }
    return {
        contentDescription: contentDescription,
        sources: [
            {
                url: image,
            },
        ],
    };
}
function toTextContext(text1, text2, text3) {
    var textContent = {
        primaryText: toRichText(text1),
    };
    if (text2) {
        textContent.secondaryText = toRichText(text2);
    }
    if (text3) {
        textContent.tertiaryText = toRichText(text3);
    }
    return textContent;
}
function toRichText(text) {
    return {
        text: text,
        type: "RichText",
    };
}
//# sourceMappingURL=DisplayTemplateBuilder.js.map