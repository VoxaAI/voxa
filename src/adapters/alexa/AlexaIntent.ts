import { IntentRequest, SlotValue } from "alexa-sdk";
import * as alexa from "alexa-sdk";
import * as _ from "lodash";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";

export class AlexaIntent implements IVoxaIntent {
  public rawIntent: any;
  public name: string;
  public params: any;

  constructor(rawIntent: alexa.Intent) {
    this.rawIntent = rawIntent;
    if (rawIntent) {
      this.name = rawIntent.name.replace(/^AMAZON./, "");
      this.params = _(rawIntent.slots)
        .map((s: SlotValue) => [s.name, s.value])
        .fromPairs()
        .value();
    } else {
      this.name = "";
      this.params = {};
    }
  }
}
