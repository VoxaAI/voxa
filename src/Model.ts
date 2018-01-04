import * as _ from "lodash";
import { IVoxaEvent } from "./VoxaEvent";

class Model {
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

interface IModel {
  new (data?: any): Model;
  fromEvent(data?: any): Model;
  serialize(): any;
}

export { Model, IModel };
