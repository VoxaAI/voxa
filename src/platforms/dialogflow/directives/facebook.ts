import * as _ from "lodash";

import { IDirective } from "../../../directives";
import { ITransition } from "../../../StateMachine";
import { IVoxaEvent } from "../../../VoxaEvent";
import { IVoxaReply } from "../../../VoxaReply";
import { DialogFlowEvent } from "../DialogFlowEvent";
import { DialogFlowReply } from "../DialogFlowReply";

export class FacebookAccountLink implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookAccountLink";

  constructor(public url: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogFlowReply = (reply as DialogFlowReply);

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      attachment: {
        payload: {
          buttons: [
            {
              type: "account_link",
              url: this.url,
            },
          ],
          template_type: "button",
          text: dialogFlowReply.fulfillmentText,
        },
        type: "template",
      },
    };
  }
}

export class FacebookSuggestionChips implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookSuggestionChips";

  constructor(public suggestions: string | string[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    let options = this.suggestions;

    if (_.isString(options)) {
      options = await event.renderer.renderPath(options, event);
    }

    const suggestionChips: any[] = [];

    _.forEach(options, (item) => {
      const button = {
        payload: item,
        title: item,
        type: "postback",
      };

      suggestionChips.push(button);
    });

    const dialogFlowReply = (reply as DialogFlowReply);

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      attachment: {
        payload: {
          buttons: suggestionChips,
          template_type: "button",
          text: dialogFlowReply.fulfillmentText,
        },
        type: "template",
      },
    };
  }
}
