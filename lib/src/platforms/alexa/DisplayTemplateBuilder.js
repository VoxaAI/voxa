"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class DisplayTemplate {
    constructor(type) {
        this.type = "Display.RenderTemplate";
        this.template = {
            type,
        };
    }
    setTitle(title) {
        if (!isTitleTemplate(this.template)) {
            throw new Error("This template does not support a title");
        }
        this.template.title = title;
        return this;
    }
    addItem(token, image, text1, text2, text3) {
        if (!isListTemplate(this.template)) {
            throw new Error("This template does not support a list items");
        }
        const item = {
            image: image ? toImage(image) : undefined,
            textContent: toTextContext(text1, text2, text3),
            token,
        };
        this.template.listItems = this.template.listItems || [];
        this.template.listItems.push(item);
        return this;
    }
    setToken(token) {
        this.template.token = token;
        return this;
    }
    setBackButton(state) {
        this.template.backButton = state;
        return this;
    }
    setTextContent(text1, text2, text3) {
        this.template.textContent = toTextContext(text1, text2, text3);
        return this;
    }
    setBackgroundImage(backgroundImage, contentDescription = "") {
        this.template.backgroundImage = toImage(backgroundImage, contentDescription);
        return this;
    }
}
exports.DisplayTemplate = DisplayTemplate;
function toImage(image, contentDescription = "") {
    return {
        contentDescription,
        sources: [
            {
                url: image,
            },
        ],
    };
}
function toTextContext(text1, text2, text3) {
    const textContent = {
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
        text,
        type: "RichText",
    };
}
function isTitleTemplate(template) {
    return _.includes([
        "BodyTemplate1",
        "BodyTemplate2",
        "BodyTemplate3",
        "BodyTemplate7",
        "ListTemplate1",
        "ListTemplate2",
    ], template.type);
}
function isListTemplate(template) {
    return _.includes([
        "ListTemplate1",
        "ListTemplate2",
    ], template.type);
}
//# sourceMappingURL=DisplayTemplateBuilder.js.map