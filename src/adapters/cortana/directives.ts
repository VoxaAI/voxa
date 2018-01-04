import { HeroCard as HeroCardType, SuggestedActions as SuggestedActionsType } from "botbuilder";
import * as _ from "lodash";
import { directiveHandler } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";
import { CortanaReply } from "./CortanaReply";

export function HeroCard(templatePath: string|HeroCardType): directiveHandler {
  return  async (reply, event): Promise<void> => {
    let attachment;
    if (_.isString(templatePath) ) {
      attachment = await reply.render(templatePath);
    } else {
      attachment = templatePath;
    }
    reply.response.directives.push({ attachment });
  };
}

export function SuggestedActions(templatePath: string|SuggestedActionsType): directiveHandler {
  return  async (reply, event): Promise<void> => {
    let suggestedActions;
    if (_.isString(templatePath) ) {
      suggestedActions = await reply.render(templatePath);
    } else {
      suggestedActions = templatePath;
    }

    reply.response.directives.push({ suggestedActions });
  };
}
