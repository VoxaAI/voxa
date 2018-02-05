/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

import { Hint } from "../src/platforms/alexa/directives";
import { IVoxaEvent } from "../src/VoxaEvent";

export const variables = {
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
  hintDirective: () => {
    return new Hint("this is the hint");
  },
  exitArray: function exitArray() {
    return [{ a: 1 }, { b: 2 }, { c: 3 }];
  },
  items: function items(request: IVoxaEvent) {
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

  count: function count(request: IVoxaEvent) {
    return Promise.resolve(request.model.count);
  },

  numberOne: function numberOne(request: IVoxaEvent) {
    if (request.request.locale === "en-US") {
      return "one";
    } else if (request.request.locale === "de-DE") {
      return "ein";
    }

    return 1;
  },
};
