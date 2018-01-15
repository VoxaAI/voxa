import { IVoxaEvent } from "./VoxaEvent";
export declare class Model {
    [key: string]: any;
    static fromEvent(voxaEvent: IVoxaEvent): Model;
    state: string;
    constructor(data?: any);
    serialize(): this;
}
export interface IModel {
    new (data?: any): Model;
    fromEvent(data?: any): Model;
    serialize(): any;
}
