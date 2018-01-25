import {
  AudioCard as AudioCardType,
  HeroCard as HeroCardType,
  IAttachment,
  ICardMediaUrl,
  SuggestedActions as SuggestedActionsType,
} from "botbuilder";
import * as _ from "lodash";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";
import { CortanaReply } from "./CortanaReply";

export class HeroCard implements IDirective {
  public static platform: string = "cortana";
  public static key: string = "cortanaHeroCard";

  public viewPath: string;
  public card: HeroCardType;

  constructor(viewPath: string|HeroCardType) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.card = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) {
    let card;
    if (this.viewPath) {
      card = await event.renderer.renderPath(this.viewPath, event);
    } else {
      card = this.card;
    }
  }
}

export class SuggestedActions implements IDirective {
  public static key: string = "cortanaSuggestedActions";
  public static platform: string = "cortana";

  public viewPath: string;
  public suggestedActions: SuggestedActionsType;

  constructor(viewPath: string|SuggestedActionsType) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.suggestedActions = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) {
    let suggestedActions;
    if (this.viewPath) {
      suggestedActions = await event.renderer.renderPath(this.viewPath, event);
    } else {
      suggestedActions = this.suggestedActions;
    }
  }
}

export class AudioCard implements IDirective {
  public static key: string = "cortanaAudioCard";
  public static platform: string = "cortana";

  public viewPath: string;
  public audioCard: AudioCardType;

  constructor(viewPath: string|AudioCardType) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.audioCard = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) {
    let audioCard;
    if (this.viewPath) {
      audioCard = await event.renderer.renderPath(this.viewPath, event);
    } else {
      audioCard = this.audioCard;
    }
  }
}
