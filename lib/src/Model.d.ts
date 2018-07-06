import { IVoxaEvent } from "./VoxaEvent";
export declare class Model {
    [key: string]: any;
    static fromEvent(voxaEvent: IVoxaEvent): Promise<Model> | Model;
    state?: string;
    constructor(data?: any);
    serialize(): any | Promise<any>;
}
export interface IModel {
    new (data?: any): Model;
    fromEvent(data?: any): Model | Promise<Model>;
}
