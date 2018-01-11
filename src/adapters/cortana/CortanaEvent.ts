import * as _ from "lodash";

import { IBotStorageData, IConversationUpdate, IEntity, IEvent, IIntentRecognizerResult, IMessage } from "botbuilder";
import { UniversalBot } from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { CortanaIntent, isIConversationUpdate, isIMessage } from "./CortanaIntent";
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

  constructor(message: IEvent, context: any, stateData: IBotStorageData, intent: IVoxaIntent|undefined) {
    super(message, context);
    this.platform = "cortana";
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
    let locale;
    if (type === "endOfConversation") {
      type = "SessionEndedRequest";
    }

    if (isIConversationUpdate(this.rawEvent) && this.rawEvent.membersAdded) {
      type = "IntentRequest";
    }

    if (this.intent && this.intent.name) {
      type = "IntentRequest";
    }

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
