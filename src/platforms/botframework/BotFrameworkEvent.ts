import * as _ from "lodash";

import {
  IBotStorage,
  IBotStorageData,
  IConversationUpdate,
  IEvent,
  IIdentity,
  IMessage,
} from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { ITypeMap, IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { IBotFrameworkEntity } from "./BotFrameworkInterfaces";

const MicrosoftCortanaIntents: ITypeMap = {
  "Microsoft.Launch": "LaunchIntent",
  "Microsoft.NoIntent": "NoIntent",
  "Microsoft.YesIntent": "YesIntent",
};

export class BotFrameworkEvent extends IVoxaEvent {
  public platform: string = "botframework";
  public session: any;
  public context: any;

  public applicationPassword!: string;
  public applicationId!: string;

  public executionContext: any;
  public rawEvent!: IEvent;

  public storage: IBotStorage;

  public requestToRequest: ITypeMap = {
    endOfConversation: "SessionEndedRequest",
  };

  public utilitiesIntentMapping: ITypeMap = {
    "Utilities.Cancel": "CancelIntent",
    "Utilities.Confirm": "YesIntent",
    // ther's no evident map of this ones so i just leave them as is
    // "Utilities.FinishTask": "",
    // "Utilities.GoBack": "",
    "Utilities.Help": "HelpIntent",
    "Utilities.Repeat": "RepeatIntent",
    "Utilities.ShowNext": "NextIntent",
    "Utilities.ShowPrevious": "PreviousIntent",
    "Utilities.StartOver": "StartOverIntent",
    "Utilities.Stop": "StopIntent",
  };

  constructor(message: IEvent, context: any, stateData: IBotStorageData, storage: IBotStorage, intent?: IVoxaIntent) {
    super(message, context);
    this.session = {
      attributes: stateData.privateConversationData || {},
      new: _.isEmpty(stateData.privateConversationData),
      outputAttributes: {},
      sessionId: _.get(message, "address.conversation.id"),
    };

    this.storage = storage;
    this.request = this.getRequest();
    this.mapRequestToRequest();

    if (intent) {
      this.request.type = "IntentRequest";
      this.intent = this.mapUtilitiesIntent(intent);
    } else {
      this.mapRequestToIntent();
      this.getIntentFromEntity();
    }
  }

  public get supportedInterfaces() {
    return [];
  }

  public getIntentFromEntity(): void {
    if (!isIMessage(this.rawEvent)) {
      return;
    }

    const intentEntity: any = _.find(this.rawEvent.entities, (e: any) => e.type ===  "Intent" );

    if (!intentEntity) {
      return;
    }

    if (intentEntity.name  === "None") {
      return;
    }

    this.request.type = "IntentRequest";
    this.intent = {
      name: MicrosoftCortanaIntents[intentEntity.name] || intentEntity.name,
      params: {},
      rawIntent: intentEntity,
    };

  }

  public mapUtilitiesIntent(intent: IVoxaIntent): IVoxaIntent {
    if (this.utilitiesIntentMapping[intent.name]) {
      intent.name = this.utilitiesIntentMapping[intent.name];
    }

    return intent;
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
          .filter((e: any) => e.type === "clientInfo")
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
