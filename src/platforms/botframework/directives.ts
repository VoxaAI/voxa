import {
  AudioCard as AudioCardType,
  HeroCard as HeroCardType,
  IAttachment,
  ICardMediaUrl,
  SigninCard as SigninCardType,
  SuggestedActions as SuggestedActionsType,
} from "botbuilder";
import * as _ from "lodash";
import * as striptags from "striptags";
import { IDirective, IDirectiveClass } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { BotFrameworkEvent } from "./BotFrameworkEvent";
import { BotFrameworkReply } from "./BotFrameworkReply";

export interface ISignInCardOptions {
  url: string;
  cardText: string;
  buttonTitle: string;
}

export class SigninCard implements IDirective {
  public static platform: string = "botframework";
  public static key: string = "botframeworkSigninCard";

  constructor(public signInOptions: ISignInCardOptions) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) {
    const card = new SigninCardType();
    card.button(this.signInOptions.buttonTitle, this.signInOptions.url);
    card.text(this.signInOptions.cardText);

    const attachments = (reply as BotFrameworkReply).attachments || [];
    attachments.push(card.toAttachment());

    (reply as BotFrameworkReply).attachments = attachments;
  }
}

export class HeroCard implements IDirective {
  public static platform: string = "botframework";
  public static key: string = "botframeworkHeroCard";

  public viewPath?: string;
  public card?: HeroCardType;

  constructor(viewPath: string | HeroCardType) {
    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.card = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) {
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

  public viewPath?: string;
  public suggestedActions?: SuggestedActionsType;

  constructor(viewPath: string | SuggestedActionsType) {
    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.suggestedActions = viewPath;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) {
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

  public url?: string;
  public audioCard?: AudioCardType;

  constructor(url: string | AudioCardType, public profile: string = "") {
    if (_.isString(url)) {
      this.url = url;
    } else {
      this.audioCard = url;
    }
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) {
    let audioCard;
    if (this.url) {
      audioCard = new AudioCardType();
      const cardMedia: ICardMediaUrl = { url: this.url, profile: this.profile };
      audioCard.media([cardMedia]);
    } else {
      audioCard = this.audioCard;
    }

    if (reply.hasMessages) {
      // we want to send stuff before the audio card
      (reply as BotFrameworkReply).inputHint = "ignoringInput";
      await (reply as BotFrameworkReply).send(event as BotFrameworkEvent);
      reply.clear();
    }

    // and now we add the card
    const attachments = (reply as BotFrameworkReply).attachments || [];

    if (!audioCard) {
      throw new Error("audioCard was not initialized");
    }

    attachments.push(audioCard.toAttachment());
    (reply as BotFrameworkReply).attachments = attachments;
    reply.terminate();
    transition.flow = "terminate";
    return await (reply as BotFrameworkReply).send(event as BotFrameworkEvent);
  }
}

export class Text implements IDirective {
  public static key: string = "text";
  public static platform: string = "botframework";

  constructor(public viewPath: string) {}
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const text = await event.renderer.renderPath(this.viewPath, event);
    reply.addStatement(text, true);
  }
}

export class TextP implements IDirective {
  public static key: string = "textp";
  public static platform: string = "botframework";

  constructor(public text: string) {}
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    reply.addStatement(this.text, true);
  }
}

export class AttachmentLayout implements IDirective {
  public static key: string = "botframeworkAttachmentLayout";
  public static platform: string = "botframework";

  constructor(public layout: string) {}
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    (reply as BotFrameworkReply).attachmentLayout = this.layout;
  }
}

export class Attachments implements IDirective {
  public static key: string = "botframeworkAttachments";
  public static platform: string = "botframework";

  constructor(public attachments: IAttachment[]) {}
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    (reply as BotFrameworkReply).attachments = this.attachments;
  }
}
