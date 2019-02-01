import * as _ from "lodash";
import { IVoxaIntent } from "../../../VoxaEvent";

export class FacebookIntent implements IVoxaIntent {
  public name: string;
  public params: any;
  public rawIntent: any;

  constructor(rawEvent: any) {
    this.rawIntent = rawEvent.queryResult.intent;
    this.name = rawEvent.queryResult.intent.displayName;

    if (!this.name || this.name === "input.unknown") {
      this.name = rawEvent.queryResult.action;
    }

    this.name = this.name.replace(/^AMAZON./, "");
    this.params = rawEvent.queryResult.parameters;
  }
}
