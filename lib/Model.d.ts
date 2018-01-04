import { IVoxaEvent } from "./VoxaEvent";
declare class Model {
    static fromEvent(voxaEvent: IVoxaEvent): Model;
    state: string;
    constructor(data?: any);
    serialize(): this;
}
interface IModel {
    new (data?: any): Model;
    fromEvent(data?: any): Model;
    serialize(): any;
}
export { Model, IModel };
