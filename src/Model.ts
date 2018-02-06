import * as _ from "lodash";
import { IVoxaEvent } from "./VoxaEvent";

export class Model {
  [key: string]: any

  public static fromEvent(voxaEvent: IVoxaEvent): Promise<Model>|Model {
    return new this(voxaEvent.session.attributes);
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
  fromEvent(data?: any): Model|Promise<Model>;
}
