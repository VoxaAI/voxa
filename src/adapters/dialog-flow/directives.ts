import * as _ from 'lodash';

import { DialogFlowReply } from './DialogFlowReply';
import { DialogFlowEvent } from './DialogFlowEvent';
import { Responses, AssistantApp } from 'actions-on-google';
import { InputValueDataTypes, StandardIntents } from './interfaces'

export function List(templatePath: string|Responses.List): Function {
  return  async (reply: DialogFlowReply, event: DialogFlowEvent): Promise<void> => {
    let listSelect;
    console.log({ templatePath })
    if (_.isString(templatePath) ) {
      listSelect= await reply.render(templatePath);
    } else {
      listSelect = templatePath;
    }

    reply.response.directives.push({
      possibleIntents: {
        intent: StandardIntents.OPTION,
        inputValueData: {
          '@type': InputValueDataTypes.OPTION,
          listSelect,
        }
      }
    });
  }
}

export function Carousel(templatePath: string|Responses.Carousel): Function{
  return  async (reply: DialogFlowReply, event: DialogFlowEvent): Promise<void> => {
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
            carouselSelect
          },
        },
      },
    });
  }
}

export function Suggestions(suggestions: string[]): Function {
  return  async (reply: DialogFlowReply, event: DialogFlowEvent): Promise<void> => {
    reply.response.directives.push({ suggestions  });
  }
}

export function BasicCard(templatePath: string|Responses.BasicCard): Function {
  return  async (reply: DialogFlowReply, event: DialogFlowEvent): Promise<void> => {
    let basicCard;
    if (_.isString(templatePath) ) {
      basicCard = await reply.render(templatePath);
    } else {
      basicCard = templatePath;
    }

    reply.response.directives.push({ basicCard  });
  }
}
