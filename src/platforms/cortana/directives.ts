import {
  AudioCard as AudioCardType,
  HeroCard as HeroCardType,
  IAttachment,
  ICardMediaUrl,
  SuggestedActions as SuggestedActionsType,
} from "botbuilder";
import * as _ from "lodash";
import { directiveHandler } from "../../directives";
import { IVoxaEvent } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";
import { CortanaReply } from "./CortanaReply";

function onlyCortana(target: ((reply: VoxaReply, event: IVoxaEvent) => Promise<void>)) {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (event.platform !== "cortana") {
      return;
    }

    return await target(reply, event);
  };
}

export function heroCard(templatePath: string|HeroCardType): directiveHandler {
  return onlyCortana(async (reply, event): Promise<void> => {
    let attachment;
    if (_.isString(templatePath) ) {
      attachment = await reply.render(templatePath);
    } else {
      attachment = templatePath;
    }
    reply.response.directives.push({ type: "attachment", attachment });
  });
}

export function suggestedActions(templatePath: string|SuggestedActionsType): directiveHandler {
  return  onlyCortana(async (reply, event): Promise<void> => {
    let actions;
    if (_.isString(templatePath) ) {
      actions = await reply.render(templatePath);
    } else {
      actions = templatePath;
    }

    reply.response.directives.push({ type: "suggestedActions", suggestedActions: actions });
  });
}

export function audioCard(url: string, title: string = "", profile: string = ""): directiveHandler {
  return  onlyCortana(async (reply, event): Promise<void> => {
    const attachment = new AudioCardType();
    attachment.title(title);
    const cardMedia: ICardMediaUrl = { url, profile };
    attachment.media([cardMedia]);

    reply.response.directives.push({ type: "attachment", attachment });
    reply.response.terminate = true;
    reply.yield();
  });
}

export function isAttachment(object: any): object is IAttachment {
  return "contentType" in object;
}

export function isSuggestedActions(object: any): object is SuggestedActionsType {
  return "actions" in object;
}
