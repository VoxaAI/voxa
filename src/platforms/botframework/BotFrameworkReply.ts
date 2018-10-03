import {
  IAttachment,
  IBotStorageContext,
  IBotStorageData,
  IChatConnectorAddress,
  IEvent,
  IIdentity,
  ISuggestedActions,
} from "botbuilder";
import * as _ from "lodash";
import * as rp from "request-promise";
import * as urljoin from "url-join";
import * as uuid from "uuid";
import { NotImplementedError } from "../../errors";
import { IBag, IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { BotFrameworkEvent, IBotframeworkPayload } from "./BotFrameworkEvent";
import { IAuthorizationResponse } from "./BotFrameworkInterfaces";
import { BotFrameworkPlatform } from "./BotFrameworkPlatform";

export class BotFrameworkReply implements IVoxaReply {
  public get hasMessages(): boolean {
    return !!this.speak || !!this.text;
  }

  public get hasDirectives(): boolean {
    return !!this.attachments || !!this.suggestedActions;
  }

  public get hasTerminated(): boolean {
    return this.inputHint === "acceptingInput";
  }

  public get speech(): string {
    if (!this.speak) {
      return "";
    }

    return this.speak;
  }
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
  public suggestedActions?: ISuggestedActions;
  public attachmentLayout?: string;

  constructor(private event: BotFrameworkEvent) {
    this.channelId = event.rawEvent.message.address.channelId;
    if (!event.session) {
      throw new Error("event.session is missing");
    }

    this.conversation = { id: event.session.sessionId };
    this.from = { id: event.rawEvent.message.address.bot.id };
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

    this.replyToId = (event.rawEvent.message
      .address as IChatConnectorAddress).id;
    this.timestamp = new Date().toISOString();
  }

  public toJSON() {
    return _.omit(this, "event");
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

  public async send() {
    this.event.log.debug("partialReply", {
      hasDirectives: this.hasDirectives,
      hasMessages: this.hasMessages,
      sendingPartialReply: !(!this.hasMessages && !this.hasDirectives),
    });

    if (!this.hasMessages && !this.hasDirectives) {
      return;
    }

    const uri = this.getReplyUri(this.event.rawEvent.message);
    this.id = uuid.v1();
    await this.botApiRequest("POST", uri, _.clone(this), this.event);
    this.clear();
  }

  public async botApiRequest(
    method: string,
    uri: string,
    reply: BotFrameworkReply,
    event: BotFrameworkEvent,
    attempts: number = 0,
  ): Promise<any> {
    let authorization: IAuthorizationResponse;
    const platform = event.platform as BotFrameworkPlatform;
    authorization = await this.getAuthorization(
      platform.applicationId,
      platform.applicationPassword,
    );
    const requestOptions: rp.Options = {
      auth: {
        bearer: authorization.access_token,
      },
      body: this,
      json: true,
      method,
      uri,
    };

    event.log.debug("botApiRequest", { requestOptions });
    return rp(requestOptions);
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

  public async getAuthorization(
    applicationId?: string,
    applicationPassword?: string,
  ): Promise<IAuthorizationResponse> {
    const url =
      "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token";
    const requestOptions: rp.Options = {
      form: {
        client_id: applicationId,
        client_secret: applicationPassword,
        grant_type: "client_credentials",
        scope: "https://api.botframework.com/.default",
      },
      json: true,
      method: "POST",
      url,
    };

    return (await rp(requestOptions)) as IAuthorizationResponse;
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    const storage = (event.platform as BotFrameworkPlatform).storage;
    const conversationId = encodeURIComponent(event.session.sessionId);
    const userId = event.rawEvent.message.address.bot.id;
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData: false,
      persistUserData: false,
      userId,
    };

    const data: IBotStorageData = {
      conversationData: {},
      // we're only gonna handle private conversation data, this keeps the code small
      // and more importantly it makes it so the programming model is the same between
      // the different platforms
      privateConversationData: attributes,
      userData: {},
    };

    await new Promise((resolve, reject) => {
      storage.saveData(context, data, (error: Error) => {
        if (error) {
          return reject(error);
        }

        event.log.debug("savedStateData", { data, context });
        return resolve();
      });
    });
  }
}
