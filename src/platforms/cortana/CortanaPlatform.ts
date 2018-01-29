
import {
  IBotStorage,
  IBotStorageContext,
  IBotStorageData,
  IChatConnectorAddress,
  IEntity,
  IEvent,
  IIntent,
  IMessage,
  LuisRecognizer,
} from "botbuilder";
import * as debug from "debug";
import * as _ from "lodash";
import { VoxaApp } from "../../VoxaApp";
import { ITypeMap, IVoxaIntent } from "../../VoxaEvent";
import { VoxaPlatform } from "../VoxaPlatform";
import { CortanaEvent } from "./CortanaEvent";
import { CortanaReply } from "./CortanaReply";
import { Ask, AudioCard, HeroCard, Say, SuggestedActions } from "./directives";

const cortanalog: debug.IDebugger = debug("voxa:cortana");

const CortanaRequests = [
  "conversationUpdate",
  "contactRelationUpdate",
  "message",
];

const MicrosoftCortanaIntents: ITypeMap = {
  "Microsoft.Launch": "LaunchIntent",
  "Microsoft.NoIntent": "NoIntent",
  "Microsoft.YesIntent": "YesIntent",
};

const toAddress = {
  channelId: "channelId",
  conversation: "conversation",
  from: "user",
  id: "id",
  recipient: "bot",
  serviceUrl: "serviceUrl",
};

export class CortanaPlatform extends VoxaPlatform {
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

    _.forEach(CortanaRequests, (requestType: string) => voxaApp.registerRequestHandler(requestType));

    this.app.directiveHandlers.push(HeroCard);
    this.app.directiveHandlers.push(SuggestedActions);
    this.app.directiveHandlers.push(AudioCard);
    this.app.directiveHandlers.push(Ask);
    this.app.directiveHandlers.push(Say);
  }

  public async execute(msg: any, context: any) {
    this.prepIncomingMessage(msg);

    const stateData: IBotStorageData|undefined = await this.getStateData(msg);
    let intent: IVoxaIntent|undefined = this.getIntentFromEntity(msg);
    if (!intent) {
      intent = await this.recognize(msg);
    }

    const event = new CortanaEvent(msg, context, stateData, intent);
    event.applicationId = this.applicationId;
    event.applicationPassword = this.applicationPassword;

    if (!event.request.locale) {
      event.request.locale = this.config.defaultLocale;
    }
    const reply = await this.app.execute(event, new CortanaReply(event)) as CortanaReply;

    await Promise.all([
      reply.send(event),
      this.saveStateData(event, reply),
    ]);

    return {};
  }

  public getIntentFromEntity(msg: IMessage): IVoxaIntent|undefined {
    const intentEntity: any = _.find(msg.entities, { type: "Intent" });

    if (!intentEntity) {
      return;
    }

    const name: string = MicrosoftCortanaIntents[intentEntity.name] || intentEntity.name;

    return {
      name,
      params: {},
      rawIntent: intentEntity,
    };
  }

  public async recognize(msg: IMessage): Promise<IVoxaIntent|undefined> {
    interface IRecognizeResult {
      intents?: IIntent[];
      entities?: IEntity[];
    }

    const { intents, entities } = await new Promise<IRecognizeResult>((resolve, reject) => {
      cortanalog({ text: msg.text });
      if (msg.text) {
        return LuisRecognizer.recognize(msg.text, this.config.recognizerURI,
          (err: Error, recognizedIntents?: IIntent[], recognizedEntities?: IEntity[]) => {
            if (err) { return reject(err); }
            cortanalog({ intents, entities });
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

        cortanalog("got stateData");
        cortanalog(result, context);
        return resolve(result);
      });
    });

  }

  public async saveStateData(event: CortanaEvent, reply: CortanaReply): Promise<void> {
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

        cortanalog("savedStateData");
        cortanalog(data, context);
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
