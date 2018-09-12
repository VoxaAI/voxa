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
import { ITypeMap, IVoxaEvent, IVoxaIntent, IVoxaUser } from "../../VoxaEvent";
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

  public applicationPassword?: string;
  public applicationId?: string;

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

  constructor(
    message: IEvent,
    context: any,
    stateData: IBotStorageData,
    storage: IBotStorage,
    intent?: IVoxaIntent | void,
  ) {
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
    const entity: any = getEntity(this.rawEvent, "DeviceInfo");
    if (!entity) {
      return [];
    }

    return entity.supportsDisplay === "true" ? ["Display"] : [];
  }

  protected getIntentFromEntity(): void {
    if (!isIMessage(this.rawEvent)) {
      return;
    }

    const intentEntity: any = getEntity(this.rawEvent, "Intent");

    if (!intentEntity) {
      return;
    }

    if (intentEntity.name === "None") {
      return;
    }

    this.request.type = "IntentRequest";
    this.intent = {
      name: MicrosoftCortanaIntents[intentEntity.name] || intentEntity.name,
      params: {},
      rawIntent: intentEntity,
    };
  }

  protected mapUtilitiesIntent(intent: IVoxaIntent): IVoxaIntent {
    if (this.utilitiesIntentMapping[intent.name]) {
      intent.name = this.utilitiesIntentMapping[intent.name];
    }

    return intent;
  }

  get user(): IVoxaUser {
    const result: IVoxaUser = {
      id: this.rawEvent.address.user.id,
    };

    if (isIMessage(this.rawEvent)) {
      const auth: any = getEntity(this.rawEvent, "AuthorizationToken");
      if (auth) {
        result.accessToken = auth.token;
      }
    }

    return result;
  }

  protected mapRequestToIntent(): void {
    if (
      isIConversationUpdate(this.rawEvent) &&
      this.rawEvent.address.channelId === "webchat"
    ) {
      // in webchat we get a conversationUpdate event when the application window is open and another when the
      // user sends his first message, we want to identify that and only do a LaunchIntent for the first one
      const membersAdded: IIdentity[] | undefined = this.rawEvent.membersAdded;
      const bot: IIdentity | undefined = this.rawEvent.address.bot;

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

  protected getRequest() {
    const type = this.rawEvent.type;
    let locale;

    if (isIMessage(this.rawEvent)) {
      if (this.rawEvent.textLocale) {
        locale = this.rawEvent.textLocale;
      }

      if (this.rawEvent.entities) {
        const entity: any = getEntity(this.rawEvent, "clientInfo");
        if (entity && entity.locale) {
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

export function isIConversationUpdate(
  event: IEvent | IConversationUpdate,
): event is IConversationUpdate {
  return event.type === "conversationUpdate";
}

export function getEntity(msg: IMessage, type: string): any {
  if (!msg.entities) {
    return;
  }

  return _.find(msg.entities, (entity) => entity.type === type);
}
