import * as _ from "lodash";

import { IDirective, IDirectiveClass } from "../../../directives";
import { ITransition } from "../../../StateMachine";
import { IVoxaEvent } from "../../../VoxaEvent";
import { IVoxaReply } from "../../../VoxaReply";
import { DialogFlowEvent } from "../DialogFlowEvent";
import { DialogFlowReply } from "../DialogFlowReply";

function createQuickReplyDirective(
  contentType: string,
  key: string,
): IDirectiveClass {
  return class implements IDirective {
    public static platform: string = "dialogflow";
    public static key: string = key;

    constructor(public message: string, public replyArray: IFacebookQuickReply|IFacebookQuickReply[]) {}

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      const dialogFlowReply = (reply as DialogFlowReply);
      const quickReplies: any[] = [];

      if (_.isEmpty(this.replyArray)) {
        quickReplies.push({
          content_type: contentType,
        });
      } else {
        if (!_.isArray(this.replyArray)) {
          this.replyArray = [this.replyArray];
        }

        _.forEach(this.replyArray, (item) => {
          quickReplies.push({
            content_type: contentType,
            image_url: item.imageUrl,
            payload: item.payload,
            title: item.title,
          });
        });
      }

      let text;

      try {
        text = await event.renderer.renderPath(this.message, event);
      } catch (err) {
        // THE VALUE SENT IS A REAL STRING AND NOT A PATH TO A VIEW
        text = this.message;
      }

      dialogFlowReply.source = "facebook";
      dialogFlowReply.payload.facebook = {
        quick_replies: quickReplies,
        text,
      };
    }
  };
}

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

    let renderedUrl;

    try {
      renderedUrl = await event.renderer.renderPath(this.url, event);
    } catch (err) {
      // THE VALUE SENT IS A REAL STRING AND NOT A PATH TO A VIEW
      renderedUrl = this.url;
    }

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      attachment: {
        payload: {
          buttons: [
            {
              type: "account_link",
              url: renderedUrl,
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

export class FacebookAccountUnlink implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookAccountUnlink";

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
              type: "account_unlink",
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

export interface IFacebookQuickReply {
  imageUrl: string;
  title: string;
  payload: string;
}

export const FacebookQuickReplyLocation = createQuickReplyDirective(
  "location",
  "facebookQuickReplyLocation",
);

export const FacebookQuickReplyPhoneNumber = createQuickReplyDirective(
  "user_phone_number",
  "facebookQuickReplyPhoneNumber",
);

export const FacebookQuickReplyText = createQuickReplyDirective(
  "text",
  "facebookQuickReplyText",
);

export const FacebookQuickReplyUserEmail = createQuickReplyDirective(
  "user_email",
  "facebookQuickReplyUserEmail",
);
