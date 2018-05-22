
import {
  IBotStorage,
  IBotStorageContext,
  IBotStorageData,
  IChatConnectorAddress,
  IEntity,
  IIntent,
  IMessage,
  LuisRecognizer,
} from "botbuilder";
import * as debug from "debug";
import * as _ from "lodash";
import { VoxaApp } from "../../VoxaApp";
import { ITypeMap, IVoxaIntent } from "../../VoxaEvent";
import { VoxaPlatform } from "../VoxaPlatform";
import { BotFrameworkEvent } from "./BotFrameworkEvent";
import { BotFrameworkReply } from "./BotFrameworkReply";
import { Ask, AudioCard, HeroCard, Say, SigninCard, SuggestedActions } from "./directives";

const botframeworklog: debug.IDebugger = debug("voxa:botframework");

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

export class BotFrameworkPlatform extends VoxaPlatform {
  public recognizerURI: string;
  public storage: IBotStorage;
  public applicationId: string;
  public applicationPassword: string;

  constructor(voxaApp: VoxaApp, config: any) {
    super(voxaApp, config);
    if (!config.storage) {
      throw new Error("Cortana requires a state storage");
    }

    this.recognizerURI = config.recognizerURI;
    this.storage = config.storage;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
  }

  // Botframework requires a lot more headers to work than
  // the other platforms
  public lambdaHTTP() {
    const ALLOWED_HEADERS = [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token",
      "X-Amz-User-Agent",
      "x-ms-client-session-id",
      "x-ms-client-request-id",
      "x-ms-effective-locale",
    ];

    return async (event: any, context: any, callback: (err: Error|null, result?: any) => void) => {
      const response = {
        body: "{}",
        headers: {
          "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(","),
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        statusCode: 200,
      };

      if (event.httpMethod !== "POST") {
        return callback(null, response);
      }

      try {
        const body = JSON.parse(event.body);
        const result = await this.execute(body, context);
        response.body = JSON.stringify(result);

        return callback(null, response);
      } catch (error) {
        return callback(error);
      }
    };
  }

  public getDirectiveHandlers() {
    return [
      HeroCard,
      SuggestedActions,
      AudioCard,
      Ask,
      SigninCard,
      Say,
    ];
  }

  public getPlatformRequests() {
    return CortanaRequests;
  }

  public async execute(msg: any, context: any) {
    msg = prepIncomingMessage(msg);

    const stateData: IBotStorageData|undefined = await this.getStateData(msg);
    const intent = await this.recognize(msg);

    const event = new BotFrameworkEvent(msg, context, stateData, intent);
    event.applicationId = this.applicationId;
    event.applicationPassword = this.applicationPassword;

    if (!event.request.locale) {
      event.request.locale = this.config.defaultLocale;
    }

    const reply = await this.app.execute(event, new BotFrameworkReply(event)) as BotFrameworkReply;

    await Promise.all([
      reply.send(event),
      this.saveStateData(event, reply),
    ]);

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
          (err: Error, recognizedIntents?: IIntent[], recognizedEntities?: IEntity[]) => {
            if (err) { return reject(err); }
            botframeworklog("Luis.ai response", { intents: recognizedIntents, entities: recognizedEntities });
            resolve({ intents: recognizedIntents, entities: recognizedEntities });
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

  public async getStateData(event: IMessage): Promise<IBotStorageData> {
    if (!event.address.conversation) {
      throw new Error("Missing conversation address");
    }

    const conversationId = encodeURIComponent(event.address.conversation.id);
    const userId = event.address.bot.id;
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData: false,
      persistUserData: false,
      userId,
    };

    return new Promise((resolve, reject) => {
      this.storage.getData(context, (err: Error, result: IBotStorageData) => {
        if (err) { return reject(err); }

        botframeworklog("got stateData");
        botframeworklog(result, context);
        return resolve(result);
      });
    });
  }

  public async saveStateData(event: BotFrameworkEvent, reply: BotFrameworkReply): Promise<void> {
    const conversationId = event.session.sessionId;
    const userId = event.rawEvent.address.bot.id;
    const context: IBotStorageContext = {
      conversationId,
      persistConversationData: false,
      persistUserData: false,
      userId,
    };

    if (!event.model) {
      return;
    }

    const data: IBotStorageData = {
      conversationData: {},
      // we're only gonna handle private conversation data, this keeps the code small
      // and more importantly it makes it so the programming model is the same between
      // the different platforms
      privateConversationData: await event.model.serialize(),
      userData: {},
    };

    await new Promise((resolve, reject) => {
      this.storage.saveData(context, data, (error: Error) => {
        if (error) { return reject(error); }

        botframeworklog("savedStateData");
        botframeworklog(data, context);
        return resolve();
      });
    });
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

export function prepIncomingMessage(msg: IMessage): IMessage {
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
