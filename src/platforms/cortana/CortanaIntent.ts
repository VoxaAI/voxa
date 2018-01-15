import { IBotStorageData, IConversationUpdate, IEntity, IEvent, IIntentRecognizerResult, IMessage } from "botbuilder";
import * as _ from "lodash";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { ICortanaEntity } from "./CortanaInterfaces";

export function isIConversationUpdate(event: IEvent | IConversationUpdate): event is IConversationUpdate {
  return event.type === "conversationUpdate";
}

export function isIMessage(event: IEvent): event is IMessage {
  return event.type === "message";
}

export class CortanaIntent implements IVoxaIntent {
  public name: string;
  public params: any;
  public rawIntent: any;

  constructor(message: IEvent) {
    this.rawIntent = message;

    const intentEntity: ICortanaEntity | undefined = _.find(this.rawIntent.entities, { type: "Intent" });
    if (!intentEntity) {
      this.name = "";
      this.params = {};
      return;
    }

    if (intentEntity.name === "Microsoft.Launch") {
      this.name = "LaunchIntent";
      this.params = {};
      return;
    }

    this.name = intentEntity.name || "";
    this.params = {};

  }
}
