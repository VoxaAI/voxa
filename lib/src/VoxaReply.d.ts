/**
 * Voxa Reply
 *
 * See message-renderer to see the response structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
import { IVoxaEvent } from "./VoxaEvent";
export interface IVoxaReply {
    hasMessages: boolean;
    hasDirectives: boolean;
    hasTerminated: boolean;
    clear: () => void;
    terminate: () => void;
    speech: string;
    reprompt?: string;
    plain?: string;
    addStatement: (statement: string, isPlain?: boolean) => void;
    addReprompt: (statement: string) => void;
    hasDirective: (type: string | RegExp) => boolean;
    saveSession: (event: IVoxaEvent) => void;
}
export declare function addToSSML(ssml: string, statement: string): string;
export declare function addToText(text: string, statement: string): string;
