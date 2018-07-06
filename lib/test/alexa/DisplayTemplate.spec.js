"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Promise.resolve().then(() => require("mocha"));
const chai_1 = require("chai");
const DisplayTemplateBuilder_1 = require("../../src/platforms/alexa/DisplayTemplateBuilder");
describe("DisplayTemplate", () => {
    it("should render to a correct BodyTemplate1", () => {
        const template = new DisplayTemplateBuilder_1.DisplayTemplate("BodyTemplate1")
            .setToken("token")
            .setTitle("This is the title")
            .setTextContent("This is the text content", "secondaryText", "tertiaryText")
            .setBackgroundImage("http://example.com/image.jpg", "Image Description")
            .setBackButton("HIDDEN");
        const pojoTemplate = JSON.parse(JSON.stringify(template));
        const expected = {
            template: {
                backButton: "HIDDEN",
                backgroundImage: {
                    contentDescription: "Image Description",
                    sources: [
                        {
                            url: "http://example.com/image.jpg",
                        },
                    ],
                },
                textContent: {
                    primaryText: {
                        text: "This is the text content",
                        type: "RichText",
                    },
                    secondaryText: {
                        text: "secondaryText",
                        type: "RichText",
                    },
                    tertiaryText: {
                        text: "tertiaryText",
                        type: "RichText",
                    },
                },
                title: "This is the title",
                token: "token",
                type: "BodyTemplate1",
            },
            type: "Display.RenderTemplate",
        };
        chai_1.expect(pojoTemplate).to.deep.equal(expected);
    });
    it("should render to a correct ListTemplate1", () => {
        const template = new DisplayTemplateBuilder_1.DisplayTemplate("ListTemplate1")
            .setToken("token")
            .setTitle("This is the title")
            .setTextContent("This is the text content", "secondaryText", "tertiaryText")
            .setBackgroundImage("http://example.com/image.jpg", "Image Description")
            .addItem("1", "http://example.com/image.jpg", "text1", "text2", "text3")
            .setBackButton("HIDDEN");
        const pojoTemplate = JSON.parse(JSON.stringify(template));
        const expected = {
            template: {
                backButton: "HIDDEN",
                backgroundImage: {
                    contentDescription: "Image Description",
                    sources: [
                        {
                            url: "http://example.com/image.jpg",
                        },
                    ],
                },
                listItems: [
                    {
                        image: {
                            contentDescription: "",
                            sources: [
                                {
                                    url: "http://example.com/image.jpg",
                                },
                            ],
                        },
                        textContent: {
                            primaryText: {
                                text: "text1",
                                type: "RichText",
                            },
                            secondaryText: {
                                text: "text2",
                                type: "RichText",
                            },
                            tertiaryText: {
                                text: "text3",
                                type: "RichText",
                            },
                        },
                        token: "1",
                    },
                ],
                textContent: {
                    primaryText: {
                        text: "This is the text content",
                        type: "RichText",
                    },
                    secondaryText: {
                        text: "secondaryText",
                        type: "RichText",
                    },
                    tertiaryText: {
                        text: "tertiaryText",
                        type: "RichText",
                    },
                },
                title: "This is the title",
                token: "token",
                type: "ListTemplate1",
            },
            type: "Display.RenderTemplate",
        };
        chai_1.expect(pojoTemplate).to.deep.equal(expected);
    });
});
//# sourceMappingURL=DisplayTemplate.spec.js.map