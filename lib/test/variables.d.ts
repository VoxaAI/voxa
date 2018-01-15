/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
import { IVoxaEvent } from "../src/VoxaEvent";
export declare const variables: {
    exitDirectiveMessage: () => {
        text: string;
        type: string;
    };
    exitCard: () => {
        type: string;
        title: string;
        text: string;
        image: {
            smallImageUrl: string;
            largeImageUrl: string;
        };
    };
    exitArray: () => ({
        a: number;
    } | {
        b: number;
    } | {
        c: number;
    })[];
    items: (request: IVoxaEvent) => any;
    time: () => "Morning" | "Afternoon" | "Evening";
    site: () => string;
    count: (request: IVoxaEvent) => Promise<any>;
    numberOne: (request: IVoxaEvent) => 1 | "one" | "ein";
};
