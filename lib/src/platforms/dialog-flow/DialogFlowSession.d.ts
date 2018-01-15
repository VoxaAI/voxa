/// <reference types="lodash" />
import { Context } from "actions-on-google/dialogflow-app";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";
export declare class DialogFlowSession implements IVoxaSession {
    attributes: any;
    contexts: Context[];
    new: boolean;
    constructor(rawEvent: any);
    getAttributes(): _.Dictionary<any>;
}
