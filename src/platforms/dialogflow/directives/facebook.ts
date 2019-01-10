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

export class FacebookQuickReplyLocation implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookQuickReplyLocation";

  constructor(public message: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogFlowReply = (reply as DialogFlowReply);

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      quick_replies: [
        {
          content_type: "location",
        },
      ],
      text: this.message,
    };
  }
}

export class FacebookQuickReplyPhoneNumber implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookQuickReplyPhoneNumber";

  constructor(public message: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogFlowReply = (reply as DialogFlowReply);

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      quick_replies: [
        {
          content_type: "user_phone_number",
        },
      ],
      text: this.message,
    };
  }
}

export class FacebookQuickReplyText implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookQuickReplyText";

  constructor(public message: string, public replyArray: IFacebookQuickReply|IFacebookQuickReply[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    if (!_.isArray(this.replyArray)) {
      this.replyArray = [this.replyArray];
    }

    const dialogFlowReply = (reply as DialogFlowReply);
    const quickReplies: any[] = [];

    _.forEach(this.replyArray, (item) => {
      quickReplies.push({
        content_type: "text",
        image_url: item.imageUrl,
        payload: item.payload,
        title: item.title,
      });
    });

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      quick_replies: quickReplies,
      text: this.message,
    };
  }
}

export class FacebookQuickReplyUserEmail implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "facebookQuickReplyUserEmail";

  constructor(public message: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogFlowReply = (reply as DialogFlowReply);

    dialogFlowReply.source = "facebook";
    dialogFlowReply.payload.facebook = {
      quick_replies: [
        {
          content_type: "user_email",
        },
      ],
      text: this.message,
    };
  }
}
