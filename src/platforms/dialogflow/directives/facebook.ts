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

function createGenericTemplateDirective(
  key: string,
  templateType: string,
): IDirectiveClass {
  return class implements IDirective {
    public static platform: string = "dialogflow";
    public static key: string = key;

    constructor(public config: string|IFacebookPayloadTemplate) {}

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      const dialogFlowReply = (reply as DialogFlowReply);
      const elements: any[] = [];
      let configElements: IFacebookElementTemplate[];
      let configButtons: IFacebookGenericButtonTemplate[]|undefined;
      let configSharable: boolean|undefined;
      let configTopElementStyle: string|undefined;

      if (_.isString(this.config)) {
        const payloadTemplate: IFacebookPayloadTemplate = await event.renderer.renderPath(this.config, event);
        configButtons = payloadTemplate.buttons;
        configElements = payloadTemplate.elements;
        configSharable = payloadTemplate.sharable;
        configTopElementStyle = payloadTemplate.topElementStyle;
      } else {
        configButtons = this.config.buttons;
        configElements = this.config.elements;
        configSharable = this.config.sharable;
        configTopElementStyle = this.config.topElementStyle;
      }

      _.forEach(configElements, (item) => {
        let defaultAction;

        if (item.defaultActionUrl) {
          defaultAction = {
            type: "web_url",
            url: item.defaultActionUrl,
          };

          if (item.defaultActionFallbackUrl) {
            _.set(defaultAction, "fallback_url", item.defaultActionFallbackUrl);
          }

          if (_.isBoolean(item.defaultMessengerExtensions)) {
            _.set(defaultAction, "messenger_extensions", item.defaultMessengerExtensions);
          }

          if (item.defaultWebviewHeightRatio) {
            _.set(defaultAction, "webview_height_ratio", item.defaultWebviewHeightRatio);
          }
        }

        let buttons: any = _.map(item.buttons, (x) => {
          const buttonFormatted: any = _.pick(x, ["payload", "title", "type", "url"]);

          buttonFormatted.fallback_url = x.fallbackUrl;
          buttonFormatted.messenger_extensions = x.messengerExtensions;
          buttonFormatted.webview_height_ratio = x.webviewHeightRatio;

          return _.omitBy(buttonFormatted, _.isNil);
        });

        if (_.isEmpty(buttons)) {
          buttons = undefined;
        }

        const elementItem: any = {
          image_url: item.imageUrl,
          subtitle: item.subtitle,
          title: item.title,
        };

        if (buttons) {
          elementItem.buttons = buttons;
        }

        if (defaultAction) {
          elementItem.default_action = defaultAction;
        }

        elements.push(elementItem);
      });

      dialogFlowReply.source = "facebook";
      dialogFlowReply.payload.facebook = {
        attachment: {
          payload: {
            elements,
            template_type: templateType,
          },
          type: "template",
        },
      };

      if (configButtons) {
        _.set(dialogFlowReply, "payload.facebook.attachment.payload.buttons", configButtons);
      }

      if (configSharable) {
        _.set(dialogFlowReply, "payload.facebook.attachment.payload.sharable", configSharable);
      }

      if (configTopElementStyle) {
        _.set(dialogFlowReply, "payload.facebook.attachment.payload.top_element_style", configTopElementStyle);
      }
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

export enum FACEBOOK_IMAGE_ASPECT_RATIO {
  HORIZONTAL = "horizontal",
  SQUARE = "square",
}

export enum FACEBOOK_WEBVIEW_HEIGHT_RATIO {
  COMPACT = "compact",
  TALL = "tall",
  FULL = "full",
}

export enum FACEBOOK_TOP_ELEMENT_STYLE {
  COMPACT = "compact",
  LARGE = "large",
}

export interface IFacebookGenericButtonTemplate {
  fallbackUrl?: string;
  messengerExtensions?: boolean;
  payload?: string;
  title: string;
  type: string;
  url?: string;
  webviewHeightRatio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
}

export interface IFacebookElementTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  imageUrl?: string;
  subtitle?: string;
  title: string;
  defaultActionUrl?: string;
  defaultActionFallbackUrl?: string;
  defaultMessengerExtensions?: boolean;
  defaultWebviewHeightRatio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
  sharable?: boolean;
}

export interface IFacebookPayloadTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  elements: IFacebookElementTemplate[];
  imageAspectRatio?: FACEBOOK_IMAGE_ASPECT_RATIO;
  sharable?: boolean;
  topElementStyle?: FACEBOOK_TOP_ELEMENT_STYLE;
}

export const FacebookCarousel = createGenericTemplateDirective(
  "facebookCarousel",
  "generic",
);

export const FacebookList = createGenericTemplateDirective(
  "facebookList",
  "list",
);
