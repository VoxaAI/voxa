"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DisplayTemplate {
    constructor(type) {
        this.type = type;
        this.listItems = [];
        this.backButton = "VISIBLE";
    }
    setTitle(title) {
        this.title = title;
        return this;
    }
    addItem(token, image, text1, text2, text3) {
        const item = {
            image: image ? toImage(image) : undefined,
            textContent: toTextContext(text1, text2, text3),
            token,
        };
        this.listItems.push(item);
        return this;
    }
    setToken(token) {
        this.token = token;
        return this;
    }
    setBackButton(state) {
        this.backButton = state;
        return this;
    }
    setTextContent(text1, text2, text3) {
        this.textContent = toTextContext(text1, text2, text3);
        return this;
    }
    setBackgroundImage(backgroundImage) {
        this.backgroundImage = toImage(backgroundImage);
        return this;
    }
    toJSON() {
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
//# sourceMappingURL=DisplayTemplateBuilder.js.map