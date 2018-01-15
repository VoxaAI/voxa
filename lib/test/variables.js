"use strict";
/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.variables = {
    exitDirectiveMessage: function exitDirectiveMessage() {
        return ({
            text: "Thanks for playing!",
            type: "PlainText",
        });
    },
    exitCard: function exitCard() {
        return {
            type: "Standard",
            title: "title",
            text: "text",
            image: {
                smallImageUrl: "smallImage.jpg",
                largeImageUrl: "largeImage.jpg",
            },
        };
    },
    exitArray: function exitArray() {
        return [{ a: 1 }, { b: 2 }, { c: 3 }];
    },
    items: function items(request) {
        return request.model.items;
    },
    time: function time() {
        var today = new Date();
        var curHr = today.getHours();
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