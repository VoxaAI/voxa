import * as _ from "lodash";

import { AssistantApp, Responses } from "actions-on-google";
import { directiveHandler } from "../../directives";
import { IVoxaEvent } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { InputValueDataTypes, StandardIntents } from "./interfaces";

function onlyDialogFlow(target: ((reply: VoxaReply, event: IVoxaEvent) => Promise<void>)) {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (event.platform !== "dialogFlow") {
      return;
    }

    return await target(reply, event);
  };
}
export function List(templatePath: string|Responses.List): directiveHandler {
  return  onlyDialogFlow(async (reply, event): Promise<void> => {
    let listSelect;
    if (_.isString(templatePath) ) {
      listSelect = await reply.render(templatePath);
    } else {
      listSelect = templatePath;
    }

    reply.response.directives.push({
      possibleIntents: {
        inputValueData: {
          "@type": InputValueDataTypes.OPTION,
          listSelect,
        },
        intent: StandardIntents.OPTION,
      },
      type: "possibleIntents",
    });
  });
}

export function Carousel(templatePath: string|Responses.Carousel): directiveHandler {
  return  onlyDialogFlow(async (reply, event): Promise<void> => {
    let carouselSelect;
    if (_.isString(templatePath) ) {
      carouselSelect = await reply.render(templatePath);
    } else {
      carouselSelect = templatePath;
    }

    reply.response.directives.push({
      systemIntent: {
        intent: StandardIntents.OPTION,
        spec: {
          optionValueSpec: {
            carouselSelect,
          },
        },
      },
      type: "systemIntent",
    });
  });
}

export function Suggestions(suggestions: string[]|string): directiveHandler {
  return  onlyDialogFlow(async (reply, event): Promise<void> => {
    if (_.isString(suggestions)) {
      suggestions = await reply.render(suggestions);
    }

    reply.response.directives.push({ suggestions, type: "suggestions"  });
  });
}

export function BasicCard(templatePath: string|Responses.BasicCard): directiveHandler {
  return  onlyDialogFlow(async (reply, event): Promise<void> => {
    let basicCard;
    if (_.isString(templatePath) ) {
      basicCard = await reply.render(templatePath);
    } else {
      basicCard = templatePath;
    }

    reply.response.directives.push({ basicCard, type: "basicCard"  });
  });
}
