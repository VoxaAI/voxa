import * as _ from "lodash";
import { IVoxaEvent } from "./VoxaEvent";

export class Model {
  [key: string]: any

  public static deserialize(data: object, voxaEvent: IVoxaEvent): Promise<Model>|Model {
    return new this(data);
  }

  public state?: string;

  constructor(data: any = {}) {
    _.assign(this, data);
  }

  public serialize(): any|Promise<any> {
    return this;
  }
}

export interface IModel {
  new (data?: any): Model;
  deserialize(data: object, event: IVoxaEvent): Model|Promise<Model>;
}
