"use strict";
/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const directives_1 = require("../src/platforms/alexa/directives");
exports.variables = {
    card2: () => {
        return new directives_1.HomeCard({
            image: {
                largeImageUrl: "http://example.com/large.jpg",
                smallImageUrl: "http://example.com/small.jpg",
            },
            title: "Title",
            type: "Standard",
        });
    },
    exitArray: function exitArray() {
        return [{ a: 1 }, { b: 2 }, { c: 3 }];
    },
    exitCard: function exitCard() {
        return {
            image: {
                largeImageUrl: "largeImage.jpg",
                smallImageUrl: "smallImage.jpg",
            },
            text: "text",
            title: "title",
            type: "Standard",
        };
    },
    exitDirectiveMessage: function exitDirectiveMessage() {
        return ({
            text: "Thanks for playing!",
            type: "PlainText",
        });
    },
    hintDirective: () => {
        return new directives_1.Hint("this is the hint");
    },
    items: function items(request) {
        return request.model.items;
    },
    time: function time() {
        const today = new Date();
        const curHr = today.getHours();
        if (curHr < 12) {
            return "Morning";
        }
        if (curHr < 18) {
            return "Afternoon";
        }
        return "Evening";
    },
    site: function site() {
        return "example.com";
    },
    count: function count(request) {
        return Promise.resolve(request.model.count);
    },
    numberOne: function numberOne(request) {
        if (request.request.locale === "en-US") {
            return "one";
        }
        else if (request.request.locale === "de-DE") {
            return "ein";
        }
        return 1;
    },
};
//# sourceMappingURL=variables.js.map