import {
  AudioCard as AudioCardType,
  HeroCard as HeroCardType,
  ICardMediaUrl,
  SuggestedActions as SuggestedActionsType,
} from "botbuilder";
import * as _ from "lodash";
import * as striptags from "striptags";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { BotFrameworkEvent } from "./BotFrameworkEvent";
import { BotFrameworkReply } from "./BotFrameworkReply";

export class HeroCard implements IDirective {
  public static platform: string = "botframework";
  public static key: string = "botframeworkHeroCard";

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

    const attachments = (reply as BotFrameworkReply).attachments || [];
    attachments.push(card.toAttachment());

    (reply as BotFrameworkReply).attachments = attachments;
  }
}

export class SuggestedActions implements IDirective {
  public static key: string = "botframeworkSuggestedActions";
  public static platform: string = "botframework";

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

    (reply as BotFrameworkReply).suggestedActions = suggestedActions.toSuggestedActions();
  }
}

export class AudioCard implements IDirective {
  public static key: string = "botframeworkAudioCard";
  public static platform: string = "botframework";

  public url: string;
  public audioCard: AudioCardType;

  constructor(url: string|AudioCardType, public profile: string = "") {

    if (_.isString(url)) {
      this.url = url;
    } else {
      this.audioCard = url;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) {
    let audioCard;
    if (this.url) {
      audioCard = new AudioCardType();
      const cardMedia: ICardMediaUrl = { url: this.url, profile: this.profile };
      audioCard.media([cardMedia]);
    } else {
      audioCard = this.audioCard;
    }

    // we want to send stuff before the audio card
    (reply as BotFrameworkReply).inputHint = "ignoringInput";
    await (reply as BotFrameworkReply).send(event as BotFrameworkEvent);

    // and now we add the card
    const attachments = (reply as BotFrameworkReply).attachments || [];
    attachments.push(audioCard.toAttachment());
    (reply as BotFrameworkReply).attachments = attachments;
    reply.terminate();
    transition.flow = "terminate";
    await (reply as BotFrameworkReply).send(event as BotFrameworkEvent);

  }
}

// i want to add plain statements
export class Ask implements IDirective {
  public static key: string = "ask";
  public static platform: string = "botframework";
  public viewPath: string;

  constructor(viewPath: string) {
    this.viewPath = viewPath;
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (event.rawEvent.address.channelId !== "webchat") {
      return;
    }

    const statement = await event.renderer.renderPath(this.viewPath, event);
    if (_.isString(statement)) {
      reply.addStatement(striptags(statement), true);
    } else if (statement.ask) {
      reply.addStatement(striptags(statement.ask), true);
    }
  }
}

// i want to add plain statements
export class Say implements IDirective {
  public static key: string = "say";
  public static platform: string = "botframework";
  public viewPath: string;

  constructor(viewPath: string) {
    this.viewPath = viewPath;
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (event.rawEvent.address.channelId !== "webchat") {
      return;
    }

    const statement = await event.renderer.renderPath(this.viewPath, event);
    reply.addStatement(striptags(statement), true);
  }
}
