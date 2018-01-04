import * as _ from "lodash";

import { IBotStorageData, IConversationUpdate, IEntity, IEvent, IIntentRecognizerResult, IMessage } from "botbuilder";
import { UniversalBot } from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { CortanaIntent } from "./CortanaIntent";
import { ICortanaEntity } from "./CortanaInterfaces";

export class CortanaEvent extends IVoxaEvent {
  public type: string;
  public session: any;
  public context: any;
  public model: Model;
  public t: TranslationFunction;
  public intent?: IVoxaIntent;

  public executionContext: any;
  public rawEvent: IMessage;

  constructor(message: IMessage, context: any, stateData: IBotStorageData, intent: IVoxaIntent|undefined) {
    super(message, context);
    this.type = "cortana";
    this.session = {
      attributes: stateData.privateConversationData || {},
      new: _.isEmpty(stateData.privateConversationData),
      sessionId: _.get(message, "address.conversation.id"),
    };

    this.context = {};

    if (intent) {
      this.intent = intent;
    } else {
      this.intent = new CortanaIntent(message);
    }
  }

  get user() {
    return _.merge(this.rawEvent.address.user, { userId: this.rawEvent.address.user.id });
  }

  get request() {
    let type = this.rawEvent.type;
    if (type === "endOfConversation") {
      type = "SessionEndedRequest";
    }

    if (this.intent && this.intent.name) {
      type = "IntentRequest";
    }

    let locale;
    if (this.rawEvent.textLocale) {
      locale = this.rawEvent.textLocale;
    } if (this.rawEvent.entities) {
      const entity: any = _(this.rawEvent.entities)
        .filter({ type: "clientInfo"})
        .filter((e: any) => !!e.locale)
        .first();

      if (entity) {
        locale = entity.locale;
      }
    }

    return { type, locale };
  }

}

function isIConversationUpdate(message: IMessage | IConversationUpdate): message is IConversationUpdate {
  return (message as IConversationUpdate).type === "conversationUpdate";
}
