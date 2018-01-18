import * as _ from "lodash";

import {
  IBotStorageData,
  IConversationUpdate,
  IEntity,
  IEvent,
  IIdentity,
  IIntentRecognizerResult,
  IMessage,
} from "botbuilder";
import { UniversalBot } from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { ITypeMap, IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { ICortanaEntity } from "./CortanaInterfaces";

export class CortanaEvent extends IVoxaEvent {
  public platform: string;
  public session: any;
  public context: any;
  public model: Model;
  public t: TranslationFunction;
  public intent?: IVoxaIntent;

  public executionContext: any;
  public rawEvent: IEvent;

  public requestToRequest: ITypeMap = {
    endOfConversation: "SessionEndedRequest",
  };

  constructor(message: IEvent, context: any, stateData: IBotStorageData, intent?: IVoxaIntent) {
    super(message, context);
    this.platform = "cortana";
    this.session = {
      attributes: stateData.privateConversationData || {},
      new: _.isEmpty(stateData.privateConversationData),
      sessionId: _.get(message, "address.conversation.id"),
    };

    this.context = {};
    this.request = this.getRequest();
    this.mapRequestToRequest();

    if (intent) {
      this.request.type = "IntentRequest";
      this.intent = intent;
    } else {
      this.mapRequestToIntent();
    }
  }

  get user() {
    return _.merge(this.rawEvent.address.user, { userId: this.rawEvent.address.user.id });
  }

  public mapRequestToIntent(): void {
    if (isIConversationUpdate(this.rawEvent) && this.rawEvent.address.channelId === "webchat") {
      // in webchat we get a conversationUpdate event when the application window is open and another when the
      // user sends his first message, we want to identify that and only do a LaunchIntent for the first one
      const membersAdded: IIdentity[]|undefined = this.rawEvent.membersAdded;
      const bot: IIdentity|undefined =  this.rawEvent.address.bot;

      if (membersAdded && bot && membersAdded.length === 1) {
        if (membersAdded[0].id === bot.id) {
          _.set(this, "intent", {
            name: "LaunchIntent",
            slots: {},
          });
          _.set(this, "request.type", "IntentRequest");
          return;
        }
      }
    } else {
      super.mapRequestToIntent();
    }
  }

  public getRequest() {
    const type = this.rawEvent.type;
    let locale;

    if (isIMessage(this.rawEvent)) {
      if (this.rawEvent.textLocale) {
        locale = this.rawEvent.textLocale;
      }

      if (this.rawEvent.entities) {
        const entity: any = _(this.rawEvent.entities)
          .filter({ type: "clientInfo"})
          .filter((e: any) => !!e.locale)
          .first();

        if (entity) {
          locale = entity.locale;
        }
      }
    }

    return { type, locale };
  }

}

export function isIMessage(event: IEvent): event is IMessage {
  return event.type === "message";
}

export function isIConversationUpdate(event: IEvent | IConversationUpdate): event is IConversationUpdate {
  return event.type === "conversationUpdate";
}
