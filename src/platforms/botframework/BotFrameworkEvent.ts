import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import {
  IBotStorageData,
  IConversationUpdate,
  IEvent,
  IIdentity,
  IMessage,
} from "botbuilder";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import { ITypeMap, IVoxaIntent, IVoxaUser, VoxaEvent } from "../../VoxaEvent";

const MicrosoftCortanaIntents: ITypeMap = {
  "Microsoft.Launch": "LaunchIntent",
  "Microsoft.NoIntent": "NoIntent",
  "Microsoft.YesIntent": "YesIntent",
};

export interface IBotframeworkPayload {
  message: IEvent;
  stateData: IBotStorageData;
  intent?: IVoxaIntent;
}

export class BotFrameworkEvent extends VoxaEvent {

  public get supportedInterfaces() {
    const entity: any = getEntity(this.rawEvent.message, "DeviceInfo");
    if (!entity) {
      return [];
    }

    return entity.supportsDisplay === "true" ? ["Display"] : [];
  }
  public rawEvent!: IBotframeworkPayload;

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
    rawEvent: IBotframeworkPayload,
    logOptions?: LambdaLogOptions,
    context?: AWSLambdaContext | AzureContext,
  ) {
    super(rawEvent, logOptions, context);
    this.request = this.getRequest();
    this.mapRequestToRequest();

    if (rawEvent.intent) {
      this.request.type = "IntentRequest";
      this.intent = this.mapUtilitiesIntent(rawEvent.intent);
    } else {
      this.mapRequestToIntent();
      this.getIntentFromEntity();
    }

    this.initUser();
  }

  public async getUserInformation(): Promise<any> {
    // TODO: RETURN USER'S INFORMATION
    return {};
  }

  protected initSession(): void {
    const privateConversationData =
      this.rawEvent.stateData.privateConversationData || {};
    const sessionId = _.get(this.rawEvent.message, "address.conversation.id");

    this.session = {
      attributes: privateConversationData,
      new: _.isEmpty(privateConversationData),
      outputAttributes: {},
      sessionId,
    };
  }

  protected getIntentFromEntity(): void {
    if (!isIMessage(this.rawEvent.message)) {
      return;
    }

    const intentEntity: any = getEntity(this.rawEvent.message, "Intent");

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

  protected initUser(): void {
    const userId = _.get(this.rawEvent.message, "address.user.id") || "";

    const user: IVoxaUser = {
      id: userId,
      userId,
    };

    if (isIMessage(this.rawEvent.message)) {
      const auth: any = getEntity(this.rawEvent.message, "AuthorizationToken");
      if (auth) {
        user.accessToken = auth.token;
      }
    }

    this.user = user;
  }

  protected mapRequestToIntent(): void {
    if (
      isIConversationUpdate(this.rawEvent.message) &&
      this.rawEvent.message.address.channelId === "webchat"
    ) {
      // in webchat we get a conversationUpdate event when the application window is open and another when the
      // user sends his first message, we want to identify that and only do a LaunchIntent for the first one
      const membersAdded: IIdentity[] | undefined = this.rawEvent.message
        .membersAdded;
      const bot: IIdentity | undefined = this.rawEvent.message.address.bot;

      if (membersAdded && bot && membersAdded.length === 1) {
        if (membersAdded[0].id === bot.id) {
          this.intent = {
            name: "LaunchIntent",
            params: {},
            rawIntent: {},
          };

          this.request.type = "IntentRequest";
          return;
        }
      }
    } else {
      super.mapRequestToIntent();
    }
  }

  protected getRequest() {
    const type = this.rawEvent.message.type;
    let locale;

    if (isIMessage(this.rawEvent.message)) {
      if (this.rawEvent.message.textLocale) {
        locale = this.rawEvent.message.textLocale;
      }

      if (this.rawEvent.message.entities) {
        const entity: any = getEntity(this.rawEvent.message, "clientInfo");
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
