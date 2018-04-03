import {
  IAttachment,
  ICardAction,
  IChatConnectorAddress,
  IEvent,
  IIdentity,
  IMessage,
} from "botbuilder";
import * as debug from "debug";
import * as _ from "lodash";
import * as rp from "request-promise";
import { StatusCodeError } from "request-promise/errors";
import * as urljoin from "url-join";
import * as uuid from "uuid";
import { NotImplementedError } from "../../errors";
import { IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { BotFrameworkEvent } from "./BotFrameworkEvent";
import { IAuthorizationResponse } from "./BotFrameworkInterfaces";

const cortanalog: debug.IDebugger = debug("voxa:botframework");

export class BotFrameworkReply implements IVoxaReply {
  // IMessage
  public channelId: string;
  public conversation: IIdentity;
  public from: IIdentity;
  public id?: string;
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

  constructor(event: IVoxaEvent) {
    this.channelId = event.rawEvent.address.channelId;
    if (!event.session) {
      throw new Error("event.session is missing");
    }

    this.conversation = { id: event.session.sessionId };
    this.from = { id: event.rawEvent.address.bot.id };
    this.inputHint = "ignoringInput";
    this.locale = event.request.locale;

    if (!event.user) {
      throw new Error("event.user is missing");
    }

    this.recipient = {
      id: event.user.id,
    };
    if (event.user.name) {
      this.recipient.name = event.user.name;
    }

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
    return this.inputHint === "acceptingInput";
  }

  public clear() {
    this.attachments = undefined;
    this.suggestedActions = undefined;
    this.text = "";
    this.speak = "";
  }

  public terminate() {
    this.inputHint = "acceptingInput";
  }

  public get speech(): string {
    if (!this.speak) {
      return "";
    }

    return this.speak;
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (this.inputHint === "ignoringInput") {
      this.inputHint = "expectingInput";
    }

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

  public async send(event: BotFrameworkEvent) {
    cortanalog("partialReply");
    cortanalog({
      hasDirectives: this.hasDirectives,
      hasMessages: this.hasMessages,
      sendingPartialReply: !(!this.hasMessages && !this.hasDirectives),
    });

    if (!this.hasMessages && !this.hasDirectives) {
      return;
    }

    const uri = this.getReplyUri(event.rawEvent);
    this.id = uuid.v1();
    await this.botApiRequest("POST", uri, _.clone(this), event);
    this.clear();
  }

  public async botApiRequest(method: string, uri: string, reply: BotFrameworkReply, event: BotFrameworkEvent, attempts: number = 0): Promise<any> {
    let authorization: IAuthorizationResponse;
    try {
      authorization = await this.getAuthorization(event.applicationId, event.applicationPassword);
      const requestOptions: rp.Options = {
        auth: {
          bearer: authorization.access_token,
        },
        body: this,
        json: true,
        method,
        uri,
      };

      cortanalog("botApiRequest");
      cortanalog(JSON.stringify(requestOptions, null, 2));
      return rp(requestOptions);
    } catch (reason) {
      if (reason instanceof StatusCodeError && attempts < 2) {
        attempts += 1;
        if (reason.statusCode === 401) {
          return this.botApiRequest(method, uri, reply, event, attempts);
        }
      }

      throw reason;
    }
  }

  public getReplyUri(event: IEvent): string {
    const address: IChatConnectorAddress = event.address;
    const baseUri = address.serviceUrl;

    if (!baseUri || !address.conversation) {
      throw new Error("serviceUrl is missing");
    }

    const conversationId = encodeURIComponent(address.conversation.id);

    let path = `/v3/conversations/${conversationId}/activities`;
    if (address.id) {
      path += "/" + encodeURIComponent(address.id);
    }

    return urljoin(baseUri, path);
  }

  public async getAuthorization(applicationId: string, applicationPassword: string): Promise<IAuthorizationResponse> {
    const requestOptions: rp.Options = {
      form: {
        client_id: applicationId,
        client_secret: applicationPassword,
        grant_type: "client_credentials",
        scope: "https://api.botframework.com/.default",
      },
      json: true,
      method: "POST",
      url: "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
    };
    cortanalog("getAuthorization");
    cortanalog(requestOptions);

    return await rp(requestOptions) as IAuthorizationResponse;
  }

}
