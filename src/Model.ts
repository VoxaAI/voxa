import * as _ from "lodash";
import { IVoxaEvent } from "./VoxaEvent";

export class Model {
  [key: string]: any

  public static fromEvent(voxaEvent: IVoxaEvent) {
    return new this(voxaEvent.session.attributes.model);
  }

  public state: string;

  constructor(data: any = {}) {
    _.assign(this, data);
  }

  public serialize() {
    return this;
  }
}

export interface IModel {
  new (data?: any): Model;
  fromEvent(data?: any): Model;
  serialize(): any;
}
