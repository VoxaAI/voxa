
import * as bluebird from "bluebird";
import { IBotStorage, IBotStorageContext, IBotStorageData, IChatConnectorAddress, IEntity, IIntent, IMessage, LuisRecognizer } from "botbuilder";
import * as debug from "debug";
import * as _ from "lodash";
import * as rp from "request-promise";
import { StatusCodeError } from "request-promise/errors";
import * as url from "url";
import * as uuid from "uuid";
import { toSSML } from "../../ssml";
import { ITransition } from "../../StateMachine";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { VoxaAdapter } from "../VoxaAdapter";
import { CortanaEvent } from "./CortanaEvent";
import { CortanaIntent } from "./CortanaIntent";
import { IAuthorizationResponse } from "./CortanaInterfaces";
import { CortanaReply } from "./CortanaReply";

const log: debug.IDebugger = debug("voxa");

const CortanaRequests = [
  "conversationUpdate",
  "contactRelationUpdate",
  "message",
];

const toAddress = {
  channelId: "channelId",
  conversation: "conversation",
  from: "user",
  id: "id",
  recipient: "bot",
  serviceUrl: "serviceUrl",
};

export class CortanaAdapter extends VoxaAdapter<CortanaReply> {
  public recognizerURI: string;
  public storage: IBotStorage;
  public applicationId: string;
  public applicationPassword: string;
  public qAuthorization: PromiseLike<IAuthorizationResponse>;

  constructor(voxaApp: VoxaApp, config: any) {
    super(voxaApp, config);
    if (!config.storage) {
      throw new Error("Cortana requires a state storage");
    }

    this.recognizerURI = config.recognizerURI;
    this.storage = config.storage;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
    this.qAuthorization = this.getAuthorization();
    this.app.onAfterStateChanged((
      voxaEvent: CortanaEvent,
      reply: CortanaReply,
      transition: ITransition,
    ) => this.partialReply(voxaEvent, reply, transition));

    _.forEach(CortanaRequests, (requestType: string) => voxaApp.registerRequestHandler(requestType));
  }

  /*
   * Sends a partial reply after every state change
   */
  public async partialReply(event: CortanaEvent, reply: CortanaReply, transition: ITransition): Promise<null> {
    if (!reply.hasMessages && !reply.hasDirectives) {
      return null;
    }

    log("partialReply");
    log({ hasMessages: reply.hasMessages, hasDirectives: reply.hasDirectives, msg: reply.response });

    await this.replyToActivity(event, reply);
    reply.clear();
    return null;
  }

  public async getAuthorization(): Promise<IAuthorizationResponse> {
    const requestOptions: rp.Options = {
      form: {
        client_id: this.applicationId,
        client_secret: this.applicationPassword,
        grant_type: "client_credentials",
        scope: "https://api.botframework.com/.default",
      },
      json: true,
      method: "POST",
      url: "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
    };
    log("getAuthorization");
    log(requestOptions);

    return rp(requestOptions);
  }

  public async execute(msg: any, context: any) {
    this.prepIncomingMessage(msg);

    const stateData: IBotStorageData|undefined = await this.getStateData(msg);
    const intent = await this.recognize(msg);
    const event = new CortanaEvent(msg, context, stateData, intent);
    const reply: CortanaReply = await this.app.execute(event, CortanaReply);
    const promises = [this.saveStateData(event, reply)];

    await Promise.all(promises);
    return {};
  }

  public async recognize(msg: IMessage): Promise<IVoxaIntent|undefined> {
    interface IRecognizeResult {
      intents?: IIntent[];
      entities?: IEntity[];
    }

    const { intents, entities } = await new Promise<IRecognizeResult>((resolve, reject) => {
      if (msg.text) {
        return LuisRecognizer.recognize(msg.text, this.config.recognizerURI,
          (err: Error, intents?: IIntent[], entities?: IEntity[]) => {
            if (err) { return reject(err); }
            resolve({ intents, entities });
          });
      }

      resolve({});
    });

    if (!intents) {
      return undefined;
    }

    return {
      name: intents[0].intent,
      params: _(entities).map(entityToParam).fromPairs().value(),
      rawIntent: { intents, entities },
    };

    function entityToParam(entity: IEntity) {
      return [entity.type, entity.entity];
    }
  }

  public prepIncomingMessage(msg: IMessage): IMessage {
    // Patch locale and channelData
    moveFieldsTo(msg, msg, {
      channelData: "sourceEvent",
      locale: "textLocale",
    });

    // Ensure basic fields are there
    msg.text = msg.text || "";
    msg.attachments = msg.attachments || [];
    msg.entities = msg.entities || [];

    // Break out address fields
    const address = {} as IChatConnectorAddress;
    moveFieldsTo(msg, address, toAddress as any);
    msg.address = address;
    msg.source = address.channelId;

    // Check for facebook quick replies
    if (msg.source === "facebook" && msg.sourceEvent && msg.sourceEvent.message && msg.sourceEvent.message.quick_reply) {
      msg.text = msg.sourceEvent.message.quick_reply.payload;
    }

    return msg;
  }

  public replyToActivity(event: CortanaEvent, reply: CortanaReply): Promise<any> {
    console.log(JSON.stringify({ event: event.rawEvent }, null, 2));
    const baseUri = (event.rawEvent.address as IChatConnectorAddress).serviceUrl;
    const conversationId = encodeURIComponent(event.session.sessionId);
    const activityId = encodeURIComponent(event.rawEvent.address.id);

    if (!baseUri) {
      throw new Error("serviceUrl is missing");
    }

    const uri = url.resolve(baseUri, `/v3/conversations/${conversationId}/activities/${activityId}`);
    return this.botApiRequest("POST", uri, reply.toJSON());
  }

  public async getStateData(event: IMessage): Promise<IBotStorageData> {
    if (!event.address.conversation) {
      throw new Error("Missing conversation address");
    }

    const conversationId = encodeURIComponent(event.address.conversation.id);
    const userId = encodeURIComponent(event.address.user.id);
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData: false,
      persistUserData: false,
      userId,
    };

    return new Promise((resolve, reject) => {
      this.storage.getData(context, (err: Error, result: IBotStorageData) => {
        if (err) { return reject(err); }
        return resolve(result);
      });
    });

  }

  public saveStateData(event: CortanaEvent, reply: CortanaReply): Promise<void> {
    const conversationId = encodeURIComponent(event.session.sessionId);
    const userId = encodeURIComponent(event.rawEvent.address.user.id);
    const persistConversationData = false;
    const persistUserData = false;
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData,
      persistUserData,
      userId,
    };

    const data: IBotStorageData = {
      conversationData: {},
      // we're only gonna handle private conversation data, this keeps the code small
      // and more importantly it makes it so the programming model is the same between
      // the different platforms
      privateConversationData: _.get(reply, "session.attributes"),
      userData: {},
    };

    return new Promise((resolve, reject) => {
      this.storage.saveData(context, data, (error: Error) => {
        if (error) { return reject(error); }
        return resolve();
      });
    });
  }

  public async botApiRequest(method: string, uri: string, body: any): Promise<any> {
    try {
      const authorization: IAuthorizationResponse = await this.qAuthorization;
      const requestOptions: rp.Options = {
        method,
        uri,
        body,
        json: true,
        auth: {
          bearer: authorization.access_token,
        },
      };

      log("botApiRequest");
      log(JSON.stringify(requestOptions, null, 2));
      return rp(requestOptions);
    } catch (reason) {
      if (reason instanceof StatusCodeError) {
        if (reason.statusCode === 401) {
          this.qAuthorization = this.getAuthorization();
          return this.botApiRequest(method, uri, body);
        }
      }

      throw reason;
    }

  }
}

export function moveFieldsTo(frm: any, to: any, fields: { [id: string]: string; }): void {
  if (frm && to) {
    for (const f in fields) {
      if (frm.hasOwnProperty(f)) {
        if (typeof to[f] === "function") {
          to[fields[f]](frm[f]);
        } else {
          to[fields[f]] = frm[f];
        }
        delete frm[f];
      }
    }
  }
}
