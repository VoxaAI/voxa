/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
import { Hint, HomeCard } from "../src/platforms/alexa/directives";
import { IVoxaEvent } from "../src/VoxaEvent";
export declare const variables: {
    card2: () => HomeCard;
    exitArray: () => ({
        a: number;
        b?: undefined;
        c?: undefined;
    } | {
        b: number;
        a?: undefined;
        c?: undefined;
    } | {
        c: number;
        a?: undefined;
        b?: undefined;
    })[];
    exitCard: () => {
        image: {
            largeImageUrl: string;
            smallImageUrl: string;
        };
        text: string;
        title: string;
        type: string;
    };
    exitDirectiveMessage: () => {
        text: string;
        type: string;
    };
    hintDirective: () => Hint;
    items: (request: IVoxaEvent) => any;
    time: () => "Morning" | "Afternoon" | "Evening";
    site: () => string;
    count: (request: IVoxaEvent) => Promise<any>;
    numberOne: (request: IVoxaEvent) => 1 | "one" | "ein";
};
