import * as _ from "lodash";
import { IBag, IVoxaEvent } from "./VoxaEvent";

export class Model {
  [key: string]: any;

  public static deserialize(
    data: IBag,
    voxaEvent: IVoxaEvent,
  ): Promise<Model> | Model {
    return new this(data);
  }

  public state?: string;

  constructor(data: any = {}) {
    _.assign(this, data);
  }

  public async serialize(): Promise<any> {
    return this;
  }
}

export interface IModel {
  new (data?: any): Model;
  deserialize(data: IBag, event: IVoxaEvent): Model | Promise<Model>;
  serialize(): Promise<any>;
}
