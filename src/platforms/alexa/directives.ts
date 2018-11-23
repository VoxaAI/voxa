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

import { dialog, Directive, interfaces, Response, ui } from "ask-sdk-model";
import * as _ from "lodash";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { AlexaReply } from "./AlexaReply";

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

export class HomeCard implements IDirective {
  public static platform: string = "alexa";
  public static key: string = "alexaCard";

  constructor(public viewPath: string | ui.Card) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
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
    transition: ITransition,
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
    transition: ITransition,
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
    transition: ITransition,
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

  constructor(viewPath: string | interfaces.alexa.presentation.apl.RenderDocumentDirective) {
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
    transition: ITransition,
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

  constructor(viewPath: string | interfaces.alexa.presentation.apl.ExecuteCommandsDirective) {
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
    transition: ITransition,
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

export class AccountLinkingCard implements IDirective {
  public static key: string = "alexaAccountLinkingCard";
  public static platform: string = "alexa";

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    if (reply.hasDirective("card")) {
      throw new Error("At most one card can be specified in a response");
    }

    const card: ui.Card = { type: "LinkAccount" };
    (reply as AlexaReply).response.card = card;
  }
}

export class PlayAudio extends AlexaDirective implements IDirective {
  public static key: string = "alexaPlayAudio";
  public static platform: string = "alexa";

  public directive?: interfaces.audioplayer.PlayDirective;

  constructor(
    public url: string,
    public token: string,
    public offsetInMilliseconds: number = 0,
    public behavior: interfaces.audioplayer.PlayBehavior = "REPLACE_ALL",
    public metadata: interfaces.audioplayer.AudioItemMetadata = {},
  ) {
    super();
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    this.validateReply(reply);

    this.directive = {
      audioItem: {
        metadata: this.metadata,
        stream: {
          offsetInMilliseconds: this.offsetInMilliseconds,
          token: this.token,
          url: this.url,
        },
      },
      playBehavior: this.behavior,
      type: "AudioPlayer.Play",
    };

    this.addDirective(reply);
  }

  private validateReply(reply: IVoxaReply) {
    if (reply.hasDirective("VideoApp.Launch")) {
      throw new Error(
        "Do not include both an AudioPlayer.Play" +
          " directive and a VideoApp.Launch directive in the same response",
      );
    }
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
    event: IVoxaEvent,
    transition: ITransition,
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
    event: IVoxaEvent,
    transition: ITransition,
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
    event: IVoxaEvent,
    transition: ITransition,
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
    event: IVoxaEvent,
    transition: ITransition,
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
    event: IVoxaEvent,
    transition: ITransition,
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
