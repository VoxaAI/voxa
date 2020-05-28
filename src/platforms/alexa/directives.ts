/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  dialog,
  Directive,
  er,
  interfaces,
  Response,
  Slot,
  ui,
} from "ask-sdk-model";
import * as _ from "lodash";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { EntityHelper } from "../share";
import { IDynamicEntity } from "../share/Entity";
import { AlexaReply } from "./AlexaReply";

function createDynamicEntity(this: any, rawEntity: any): IDynamicEntity[] {
  const dynamicEntity = rawEntity.reduce(
    (filteredEntity: any, property: any): any => {
      let newEntity: IDynamicEntity;
      const name = this.validateEntityName(property, "alexa");
      this.validateEntity(property);

      validateAlexaEntityBehavior(property);

      newEntity = this.dynamicEntityObject(property, name);

      filteredEntity.push(newEntity);
      return filteredEntity;
    },
    [],
  );
  return dynamicEntity;
}

function isCard(card: any): card is ui.Card {
  if (!("type" in card)) {
    return false;
  }

  return _.includes(
    ["Standard", "Simple", "LinkAccount", "AskForPermissionsConsent"],
    card.type,
  );
}

export abstract class AlexaDirective {
  public directive?: Directive | Directive[];

  protected addDirective(reply: IVoxaReply) {
    const response: Response = (reply as AlexaReply).response;
    if (!response.directives) {
      response.directives = [];
    }

    if (!this.directive) {
      throw new Error("The directive can't be empty");
    }

    if (_.isArray(this.directive)) {
      response.directives = _.concat(response.directives, this.directive);
    } else {
      response.directives.push(this.directive);
    }
  }
}

export abstract class MultimediaAlexaDirective extends AlexaDirective {
  protected validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("AudioPlayer.Play")) {
      throw new Error(
        "Do not include both an AudioPlayer.Play" +
          " directive and a VideoApp.Launch directive in the same response",
      );
    }
  }
}

export class HomeCard implements IDirective {
  public static platform: string = "alexa";
  public static key: string = "alexaCard";

  constructor(public viewPath: string | ui.Card) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    if (reply.hasDirective("card")) {
      throw new Error("At most one card can be specified in a response");
    }

    let card: ui.Card;
    if (_.isString(this.viewPath)) {
      card = await event.renderer.renderPath(this.viewPath, event);
      if (!isCard(card)) {
        throw new Error("The view should return a Card like object");
      }
    } else if (isCard(this.viewPath)) {
      card = this.viewPath;
    } else {
      throw new Error("Argument should be a viewPath or a Card like object");
    }

    (reply as AlexaReply).response.card = card;
  }
}

export class Hint implements IDirective {
  public static platform: string = "alexa";
  public static key: string = "alexaHint";

  constructor(public viewPath: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    if (reply.hasDirective("Hint")) {
      throw new Error(
        "At most one Hint directive can be specified in a response",
      );
    }

    const response: Response = (reply as AlexaReply).response || {};
    if (!response.directives) {
      response.directives = [];
    }

    const text = await event.renderer.renderPath(this.viewPath, event);
    response.directives.push({
      hint: {
        text,
        type: "PlainText",
      },
      type: "Hint",
    });

    (reply as AlexaReply).response = response;
  }
}

export class DialogDelegate extends AlexaDirective implements IDirective {
  public static platform: string = "alexa";
  public static key: string = "alexaDialogDelegate";
  public directive!: dialog.DelegateDirective;

  constructor(public slots?: any) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.buildDirective(event);
    this.buildSlots(event);
    this.addDirective(reply);
  }

  protected buildSlots(event: IVoxaEvent) {
    if (!event.intent) {
      throw new Error("An intent is required");
    }

    if (!this.slots) {
      return;
    }

    const directiveSlots = _(this.slots)
      .map((value, key) => {
        const data: any = {
          confirmationStatus: "NONE",
          name: key,
        };

        if (value) {
          data.value = value;
        }

        return [key, data];
      })
      .fromPairs()
      .value();

    this.directive.updatedIntent = {
      confirmationStatus: "NONE",
      name: event.intent.name,
      slots: directiveSlots,
    };
  }

  protected buildDirective(event: IVoxaEvent) {
    this.directive = {
      type: "Dialog.Delegate",
    };
  }
}

export interface IElicitDialogOptions {
  slotToElicit: string;
  slots: { [key: string]: Slot };
}

export class DialogElicitSlot extends AlexaDirective implements IDirective {
  public static platform: string = "alexa";
  public static key: string = "alexaElicitDialog";

  private static validate(
    options: IElicitDialogOptions,
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) {
    if (reply.hasDirective("Dialog.ElicitSlot")) {
      throw new Error(
        "At most one Dialog.ElicitSlot directive can be specified in a response",
      );
    }

    if (
      transition.to &&
      transition.to !== "die" &&
      transition.to !== _.get(event, "rawEvent.request.intent.name")
    ) {
      throw new Error(
        "You cannot transition to a new intent while using a Dialog.ElicitSlot directive",
      );
    }

    if (!options.slotToElicit) {
      throw new Error(
        "slotToElicit is required for the Dialog.ElicitSlot directive",
      );
    }

    if (
      !_.has(event, "rawEvent.request.dialogState") ||
      _.get(event, "rawEvent.request.dialogState") === "COMPLETED"
    ) {
      throw new Error(
        "Intent is missing dialogState or has already completed this dialog and cannot elicit any slots",
      );
    }
  }

  public directive!: dialog.ElicitSlotDirective;

  constructor(public options: IElicitDialogOptions) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    DialogElicitSlot.validate(this.options, reply, event, transition);
    this.buildDirective(event);
    // Alexa is always going to return to this intent with the results of this dialog
    // so we can't move anywhere else.
    transition.flow = "yield";
    transition.to = _.get(event, "rawEvent.request.intent.name");

    this.addDirective(reply);
  }

  protected buildDirective(event: IVoxaEvent) {
    const intent = _.get(event, "rawEvent.request.intent");
    const slots = intent.slots;

    if (this.options.slots) {
      _.forOwn(this.options.slots, (value, key) => {
        if (_.has(slots, key)) {
          if (!_.has(value, "name")) {
            _.set(value, "name", key);
          }
          slots[key] = value;
        }
      });
    }

    this.directive = {
      slotToElicit: this.options.slotToElicit,
      type: "Dialog.ElicitSlot",
      updatedIntent: {
        confirmationStatus: "NONE",
        name: intent.name,
        slots,
      },
    };
  }
}

export class RenderTemplate extends AlexaDirective implements IDirective {
  public static key: string = "alexaRenderTemplate";
  public static platform: string = "alexa";

  public viewPath?: string;
  public token?: string;
  public directive?: interfaces.display.RenderTemplateDirective;

  constructor(viewPath: string | interfaces.display.RenderTemplateDirective) {
    super();

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "Display")) {
      return;
    }

    if (this.viewPath) {
      this.directive = await event.renderer.renderPath(this.viewPath, event);
    }

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("Display.RenderTemplate")) {
      throw new Error(
        "At most one Display.RenderTemplate directive can be specified in a response",
      );
    }
  }
}

export class APLTemplate extends AlexaDirective implements IDirective {
  public static key: string = "alexaAPLTemplate";
  public static platform: string = "alexa";

  public viewPath?: string;
  public directive?: interfaces.alexa.presentation.apl.RenderDocumentDirective;

  constructor(
    viewPath: string | interfaces.alexa.presentation.apl.RenderDocumentDirective,
  ) {
    super();

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "Alexa.Presentation.APL")) {
      return;
    }

    if (this.viewPath) {
      this.directive = await event.renderer.renderPath(this.viewPath, event);
    }

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("Alexa.Presentation.APL.RenderDocument")) {
      throw new Error(
        "At most one Alexa.Presentation.APL.RenderDocument directive can be specified in a response",
      );
    }
  }
}

export class APLCommand extends AlexaDirective implements IDirective {
  public static key: string = "alexaAPLCommand";
  public static platform: string = "alexa";

  public viewPath?: string;
  public directive?: interfaces.alexa.presentation.apl.ExecuteCommandsDirective;

  constructor(
    viewPath:
      | string
      | interfaces.alexa.presentation.apl.ExecuteCommandsDirective,
  ) {
    super();

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "Alexa.Presentation.APL")) {
      return;
    }

    if (this.viewPath) {
      this.directive = await event.renderer.renderPath(this.viewPath, event);
    }

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("Alexa.Presentation.APL.ExecuteCommands")) {
      throw new Error(
        "At most one Alexa.Presentation.APL.ExecuteCommands directive can be specified in a response",
      );
    }
  }
}

export class APLTTemplate extends AlexaDirective implements IDirective {
  public static key: string = "alexaAPLTTemplate";
  public static platform: string = "alexa";

  public viewPath?: string;
  public directive?: interfaces.alexa.presentation.aplt.RenderDocumentDirective;

  constructor(
    viewPath:
      | string
      | interfaces.alexa.presentation.aplt.RenderDocumentDirective,
  ) {
    super();

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "Alexa.Presentation.APLT")) {
      return;
    }

    if (this.viewPath) {
      this.directive = await event.renderer.renderPath(this.viewPath, event);
    }

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("Alexa.Presentation.APLT.RenderDocument")) {
      throw new Error(
        "At most one Alexa.Presentation.APLT.RenderDocument directive can be specified in a response",
      );
    }
  }
}

export class APLTCommand extends AlexaDirective implements IDirective {
  public static key: string = "alexaAPLTCommand";
  public static platform: string = "alexa";

  public viewPath?: string;
  public directive?: interfaces.alexa.presentation.aplt.ExecuteCommandsDirective;

  constructor(
    viewPath:
      | string
      | interfaces.alexa.presentation.aplt.ExecuteCommandsDirective,
  ) {
    super();

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "Alexa.Presentation.APLT")) {
      return;
    }

    if (this.viewPath) {
      this.directive = await event.renderer.renderPath(this.viewPath, event);
    }

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("Alexa.Presentation.APLT.ExecuteCommands")) {
      throw new Error(
        "At most one Alexa.Presentation.APLT.ExecuteCommands directive can be specified in a response",
      );
    }
  }
}

export class AccountLinkingCard implements IDirective {
  public static key: string = "alexaAccountLinkingCard";
  public static platform: string = "alexa";

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    if (reply.hasDirective("card")) {
      throw new Error("At most one card can be specified in a response");
    }

    const card: ui.Card = { type: "LinkAccount" };
    (reply as AlexaReply).response.card = card;
  }
}

export interface IAlexaPlayAudioDataOptions {
  url: string;
  token: string;
  offsetInMilliseconds?: number;
  behavior?: interfaces.audioplayer.PlayBehavior;
  metadata?: interfaces.audioplayer.AudioItemMetadata;
}

export class PlayAudio extends MultimediaAlexaDirective implements IDirective {
  public static key: string = "alexaPlayAudio";
  public static platform: string = "alexa";

  public directive?: interfaces.audioplayer.PlayDirective;

  constructor(public data: IAlexaPlayAudioDataOptions) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    this.directive = {
      audioItem: {
        metadata: this.data.metadata || {},
        stream: {
          offsetInMilliseconds: this.data.offsetInMilliseconds || 0,
          token: this.data.token,
          url: this.data.url,
        },
      },
      playBehavior: this.data.behavior || "REPLACE_ALL",
      type: "AudioPlayer.Play",
    };

    this.addDirective(reply);
  }
}

export class StopAudio extends AlexaDirective implements IDirective {
  public static key: string = "alexaStopAudio";
  public static platform: string = "alexa";

  public directive: interfaces.audioplayer.StopDirective = {
    type: "AudioPlayer.Stop",
  };

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.addDirective(reply);
  }
}

export class GadgetControllerLightDirective extends AlexaDirective
  implements IDirective {
  public static key: string = "alexaGadgetControllerLightDirective";
  public static platform: string = "alexa";

  constructor(
    public directive:
      | interfaces.gadgetController.SetLightDirective
      | interfaces.gadgetController.SetLightDirective[],
  ) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.addDirective(reply);
  }
}

export class GameEngineStartInputHandler extends AlexaDirective
  implements IDirective {
  public static key: string = "alexaGameEngineStartInputHandler";
  public static platform: string = "alexa";

  constructor(
    public directive: interfaces.gameEngine.StartInputHandlerDirective,
  ) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.addDirective(reply);

    const response = (reply as AlexaReply).response;
    delete response.shouldEndSession;
  }
}

export class GameEngineStopInputHandler extends AlexaDirective
  implements IDirective {
  public static key: string = "alexaGameEngineStopInputHandler";
  public static platform: string = "alexa";

  constructor(public originatingRequestId: string) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.directive = {
      originatingRequestId: this.originatingRequestId,
      type: "GameEngine.StopInputHandler",
    };

    this.addDirective(reply);
  }
}

export class ConnectionsSendRequest extends AlexaDirective
  implements IDirective {
  public static key: string = "alexaConnectionsSendRequest";
  public static platform: string = "alexa";

  public name?: string;
  public directive?: interfaces.connections.SendRequestDirective;
  public type?: string = "Connections.SendRequest";

  constructor(
    name: string | interfaces.connections.SendRequestDirective,
    public payload: any,
    public token: string,
  ) {
    super();
    if (_.isString(name)) {
      this.name = name;
    } else {
      this.directive = name;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event?: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    if (this.name) {
      this.directive = {
        name: this.name,
        payload: this.payload,
        token: this.token || "token",
        type: "Connections.SendRequest",
      };
    }

    this.addDirective(reply);
  }
}

export interface IAlexaVideoDataOptions {
  source: string;
  title?: string;
  subtitle?: string;
}

export class VideoAppLaunch extends MultimediaAlexaDirective {
  public static key: string = "alexaVideoAppLaunch";
  public static platform: string = "alexa";

  public directive?: interfaces.videoapp.LaunchDirective;

  constructor(public options: IAlexaVideoDataOptions | string) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    if (!_.includes(event.supportedInterfaces, "VideoApp")) {
      return;
    }

    let options: IAlexaVideoDataOptions;
    if (_.isString(this.options)) {
      options = await event.renderer.renderPath(this.options, event);
    } else {
      options = this.options;
    }

    this.directive = {
      type: "VideoApp.Launch",
      videoItem: {
        metadata: {
          subtitle: options.subtitle,
          title: options.title,
        },
        source: options.source,
      },
    };

    this.addDirective(reply);
  }
}

export class DynamicEntitiesDirective extends AlexaDirective
  implements IDirective {
  public static key: string = "alexaDynamicEntities";
  public static platform: string = "alexa";

  public viewPath?: string;
  public types?: er.dynamic.EntityListItem[];
  public directive?: dialog.DynamicEntitiesDirective;

  constructor(
    viewPath:
      | string
      | dialog.DynamicEntitiesDirective
      | er.dynamic.EntityListItem[],
  ) {
    super();
    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else if (_.isArray(viewPath)) {
      this.types = viewPath;
    } else {
      this.directive = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let types = [];

    if (this.viewPath) {
      types = await event.renderer.renderPath(this.viewPath, event);

      this.directive = {
        type: "Dialog.UpdateDynamicEntities",
        types,
        updateBehavior: "REPLACE",
      };
    }

    if (this.types) {
      this.directive = {
        type: "Dialog.UpdateDynamicEntities",
        types: this.types,
        updateBehavior: "REPLACE",
      };
    }

    this.addDirective(reply);
  }
}

export class Entity extends EntityHelper implements IDirective {
  public static key: string = "entities";
  public static platform: string = "alexa";
  public viewPath?: any | any[];
  constructor(viewPath: any | any[]) {
    super();
    this.viewPath = viewPath;
  }
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let entity: any = this.viewPath;
    entity = await this.getGenericEntity(entity, event, this.viewPath);

    const dynamicEntity = createDynamicEntity.bind(this, entity);
    entity = dynamicEntity();

    const behavior: er.dynamic.UpdateBehavior = validateAlexaEntityBehavior(
      _.chain(entity)
        .map((e) => e.updateBehavior)
        .find()
        .value(),
    );

    entity = {
      type: "Dialog.UpdateDynamicEntities",
      types: entity,
      updateBehavior: behavior,
    };

    const response: Response = (reply as AlexaReply).response;
    if (!response.directives) {
      response.directives = [];
    }
    if (_.isArray(response.directives)) {
      response.directives = _.concat(response.directives, entity);
    } else {
      response.directives!.push(entity);
    }
  }
}

function validateAlexaEntityBehavior(property: any): er.dynamic.UpdateBehavior {
  let behavior: er.dynamic.UpdateBehavior = _.get(property, "updateBehavior");

  let defaultBehavior: er.dynamic.UpdateBehavior;
  let behaviorList: any;
  let error: string;

  ({ defaultBehavior, behaviorList, error } = getAlexaBehaviorError());

  behavior = behavior || defaultBehavior;

  if (!_.includes(behaviorList, behavior)) {
    throw new Error(error);
  }
  return behavior;
}

function getAlexaBehaviorError() {
  enum UpdateBehavior {
    Replace = "REPLACE",
    Clear = "CLEAR",
  }

  const alexaEntityBehaviorList = [
    UpdateBehavior.Replace,
    UpdateBehavior.Clear,
  ];

  const defaultBehavior = UpdateBehavior.Replace;
  const behaviorList = alexaEntityBehaviorList;
  // tslint:disable-next-line: max-line-length
  const error = `The updateBehavior is incorrect, please consider use one of the followings: ${UpdateBehavior.Replace} or ${UpdateBehavior.Clear}`;

  return { defaultBehavior, behaviorList, error };
}
