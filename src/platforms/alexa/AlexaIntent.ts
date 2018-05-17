import { Intent, Slot } from "ask-sdk-model";
import * as _ from "lodash";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";

export class AlexaIntent implements IVoxaIntent {
  public rawIntent: any;
  public name: string;
  public params: any;

  constructor(rawIntent: Intent) {
    this.rawIntent = rawIntent;
    if (rawIntent) {
      this.name = rawIntent.name.replace(/^AMAZON./, "");
      this.params = _(rawIntent.slots)
        .map((s: Slot) => [s.name, s.value])
        .fromPairs()
        .value();
    } else {
      this.name = "";
      this.params = {};
    }
  }
}
