import {
  IAddress,
  IAttachment,
  ICardAction,
  IChatConnectorAddress,
  IIdentity,
  IIsAttachment,
  IMessage,
  ISuggestedActions,
} from "botbuilder";
import * as _ from "lodash";
import * as striptags from "striptags";
import * as uuid from "uuid";
import { NotImplementedError } from "../../errors";
import { toSSML } from "../../ssml";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";

export class CortanaReply implements IVoxaReply {
  public speech: string;

  // IMessage
  public channelId: string;
  public conversation: IIdentity;
  public from: IIdentity;
  public id: string;
  public inputHint: string;
  public locale: string;
  public recipient: IIdentity;
  public replyToId?: string;
  public speak: string = "";
  public text: string = "";
  public textFormat: string = "plain";
  public timestamp: string;
  public type: string = "message";
  public attachments?: IAttachment[];
  public suggestedActions?: ICardAction[];

  constructor(event: CortanaEvent) {
    this.channelId = event.rawEvent.address.channelId;
    this.conversation = { id: event.session.sessionId };
    this.from = { id: event.rawEvent.address.bot.id };
    this.id = uuid.v1();
    this.inputHint = "ignoringInput";
    this.locale = event.request.locale;
    this.recipient = {
      id: event.user.id,
      name: event.user.name,
    };
    this.replyToId = (event.rawEvent.address as IChatConnectorAddress).id;
    this.timestamp = new Date().toISOString();
  }

  public get hasMessages(): boolean {
    return !!this.speak || !!this.text;
  }

  public get hasDirectives(): boolean {
    return !!this.attachments || !!this.suggestedActions;
  }

  public get hasTerminated(): boolean {
    throw new NotImplementedError("hasTerminated");
  }

  public clear() {
    this.attachments = undefined;
    this.suggestedActions = undefined;
    this.text = "";
    this.speak = "";
  }

  public terminate() {
    throw new NotImplementedError("terminate");
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (isPlain) {
      this.text = addToText(this.text, statement);
    } else {
      this.speak = addToSSML(this.speak, statement);
    }
  }

  public hasDirective(type: string | RegExp): boolean {
    throw new NotImplementedError("hasDirective");
  }

  public addReprompt(reprompt: string) {
    return;
  }
}
