import {
  IAddress,
  IBotStorage,
  IBotStorageContext,
  IBotStorageData,
  IEvent,
  IMessage,
} from "botbuilder";
import * as debug from "debug";
import * as _ from "lodash";
import { VoxaApp } from "../../VoxaApp";
import { ITypeMap, IVoxaIntent } from "../../VoxaEvent";
import { BotFrameworkEvent } from "../botframework/BotFrameworkEvent";
import { BotFrameworkPlatform } from "../botframework/BotFrameworkPlatform";
import { BotFrameworkReply } from "../botframework/BotFrameworkReply";

const botletlog: debug.IDebugger = debug("voxa:botlet");

export interface IBotletEvent {
  userId: string;
  conversationId: string;
  utterance: string;
}

export class BotletPlatform extends BotFrameworkPlatform {
  public recognizerURI: string;
  public storage: IBotStorage;
  public applicationId: string;
  public applicationPassword: string;
  public directiveHandlers = [];

  public getPlatformRequests() {
    return [];
  }

  public getDirectiveHandlers() {
    return [];
  }

  public async execute(msg: IBotletEvent, context: any) {
    const botFrameworkEvent: IEvent = botletToFramework(msg);

    const stateData: IBotStorageData|undefined = await this.getStateData(botFrameworkEvent);
    const intent = await this.recognize(botFrameworkEvent);

    const event = new BotFrameworkEvent(botFrameworkEvent, context, stateData, intent);
    event.applicationId = this.applicationId;
    event.applicationPassword = this.applicationPassword;

    if (!event.request.locale) {
      event.request.locale = this.config.defaultLocale;
    }

    const reply = await this.app.execute(event, new BotFrameworkReply(event)) as BotFrameworkReply;

    await this.saveStateData(event, reply);

    return reply;
  }

}

export function botletToFramework(event: IBotletEvent): IMessage {
  const address: IAddress = {
    bot: {
      id: "cortanaBot",
    },
    channelId: "cortana",
    conversation: {
      id: event.conversationId,
    },
    user: {
      id: event.userId,
    },
  };

  return {
    address,
    agent: "botframework",
    source: "",
    sourceEvent: "",
    text: event.utterance,
    type: "message",
    user: {
      id: event.userId,
    },
  };
}
