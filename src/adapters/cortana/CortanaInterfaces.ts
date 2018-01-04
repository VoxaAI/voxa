import * as builder from "botbuilder";
import { IVoxaIntent } from "../../VoxaEvent";

export interface ICortanaEntity {
    type: string;
    name?: string;
    supportsDisplay?: boolean;
    locale?: string;
}

export interface IAuthorizationResponse {
    access_token: string;
}
