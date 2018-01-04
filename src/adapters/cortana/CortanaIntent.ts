import { IBotStorageData, IConversationUpdate, IEntity, IEvent, IIntentRecognizerResult, IMessage } from "botbuilder";
import * as _ from "lodash";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { ICortanaEntity } from "./CortanaInterfaces";

export class CortanaIntent implements IVoxaIntent {
  public name: string;
  public params: any;
  public rawIntent: any;

  constructor(message: IMessage|IConversationUpdate) {
    this.rawIntent = message;

    const intentEntity: ICortanaEntity | undefined = _.find(this.rawIntent.entities, { type: "Intent" });
    if (!intentEntity) {
      this.name = "";
      this.params = {};
    } else {
      if (intentEntity.name === "Microsoft.Launch") {
        this.name = "LaunchIntent";
        this.params = {};
      } else {
        this.name = intentEntity.name || "";
        this.params = {};
      }
    }

  }
}
