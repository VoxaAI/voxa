import * as _ from "lodash";

import { AssistantApp, Responses } from "actions-on-google";
import { directiveHandler } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { InputValueDataTypes, StandardIntents } from "./interfaces";

export function List(templatePath: string|Responses.List): directiveHandler {
  return  async (reply, event): Promise<void> => {
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
    });
  };
}

export function Carousel(templatePath: string|Responses.Carousel): directiveHandler {
  return  async (reply, event): Promise<void> => {
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
    });
  };
}

export function Suggestions(suggestions: string[]): directiveHandler {
  return  async (reply, event): Promise<void> => {
    reply.response.directives.push({ suggestions  });
  };
}

export function BasicCard(templatePath: string|Responses.BasicCard): directiveHandler {
  return  async (reply, event): Promise<void> => {
    let basicCard;
    if (_.isString(templatePath) ) {
      basicCard = await reply.render(templatePath);
    } else {
      basicCard = templatePath;
    }

    reply.response.directives.push({ basicCard  });
  };
}
