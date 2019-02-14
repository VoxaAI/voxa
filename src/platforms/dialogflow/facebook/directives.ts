import * as _ from "lodash";

import { IDirective, IDirectiveClass } from "../../../directives";
import { ITransition } from "../../../StateMachine";
import { IVoxaEvent } from "../../../VoxaEvent";
import { IVoxaReply } from "../../../VoxaReply";
import { DialogflowEvent } from "../DialogflowEvent";
import { FacebookReply } from "./FacebookReply";

function createQuickReplyDirective(
  contentType: string,
  key: string,
): IDirectiveClass {
  return class implements IDirective {
    public static platform: string = "facebook";
    public static key: string = key;

    constructor(
      public message: string,
      public replyArray: IFacebookQuickReply | IFacebookQuickReply[],
    ) {}

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      const dialogflowReply = reply as FacebookReply;
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

      dialogflowReply.source = event.platform.name;
      dialogflowReply.payload.facebook = {
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
    public static platform: string = "facebook";
    public static key: string = key;

    constructor(public config: string|IFacebookPayloadTemplate) {}

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      const dialogflowReply = (reply as FacebookReply);
      let configElements: IFacebookElementTemplate[]|undefined;
      let configButtons: IFacebookGenericButtonTemplate[]|undefined;
      let configSharable: boolean|undefined;
      let configText: string|undefined;
      let configTopElementStyle: FACEBOOK_TOP_ELEMENT_STYLE|undefined;

      if (_.isString(this.config)) {
        const payloadTemplate: IFacebookPayloadTemplate = await event.renderer.renderPath(this.config, event);
        configButtons = payloadTemplate.buttons;
        configElements = payloadTemplate.elements;
        configSharable = payloadTemplate.sharable;
        configText = payloadTemplate.text;
        configTopElementStyle = payloadTemplate.topElementStyle;
      } else {
        configButtons = this.config.buttons;
        configElements = this.config.elements;
        configSharable = this.config.sharable;
        configText = this.config.text;
        configTopElementStyle = this.config.topElementStyle;
      }

      const elements = getTemplateElements(configElements);

      const facebookPayload: IVoxaFacebookPayloadTemplate = {
        buttons: configButtons,
        sharable: configSharable,
        template_type: templateType,
        text: configText,
        top_element_style: configTopElementStyle,
      };

      if (!_.isEmpty(elements)) {
        facebookPayload.elements = elements;
      }

      dialogflowReply.source = event.platform.name;
      dialogflowReply.payload.facebook = {
        attachment: {
          payload: _.omitBy(facebookPayload, _.isNil),
          type: "template",
        },
      };
    }
  };
}

function getTemplateElements(configElements: IFacebookElementTemplate[]|undefined) {
  const elements: any[] = [];

  _.forEach(configElements, (item) => {
    let defaultAction;

    if (item.defaultActionUrl) {
      defaultAction = {
        fallback_url: item.defaultActionFallbackUrl,
        messenger_extensions: item.defaultMessengerExtensions,
        type: "web_url",
        url: item.defaultActionUrl,
        webview_height_ratio: item.defaultWebviewHeightRatio,
      };

      defaultAction = _.omitBy(defaultAction, _.isNil);
    }

    const buttons = _.map(item.buttons, (x) => {
      const buttonFormatted: any = _.pick(x, ["payload", "title", "type", "url"]);

      buttonFormatted.fallback_url = x.fallbackUrl;
      buttonFormatted.messenger_extensions = x.messengerExtensions;
      buttonFormatted.webview_height_ratio = x.webviewHeightRatio;

      return _.omitBy(buttonFormatted, _.isNil);
    }) as IVoxaFacebookGenericButtonTemplate[];

    const elementItem: IVoxaFacebookElementTemplate = {
      buttons,
      default_action: defaultAction,
      image_url: item.imageUrl,
      subtitle: item.subtitle,
      title: item.title,
      url: item.url,
    };

    elements.push(_.omitBy(elementItem, _.isEmpty));
  });

  return elements;
}

export class FacebookAccountLink implements IDirective {
  public static platform: string = "facebook";
  public static key: string = "facebookAccountLink";

  constructor(public url: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogflowReply = reply as FacebookReply;

    let renderedUrl;

    try {
      renderedUrl = await event.renderer.renderPath(this.url, event);
    } catch (err) {
      // THE VALUE SENT IS A REAL STRING AND NOT A PATH TO A VIEW
      renderedUrl = this.url;
    }

    const { fulfillmentText } = dialogflowReply;
    const facebookPayload = this.getFacebookPayload(renderedUrl, fulfillmentText);

    dialogflowReply.source = event.platform.name;
    dialogflowReply.payload.facebook = facebookPayload;
  }

  private getFacebookPayload(
    renderedUrl: string, fulfillmentText: string,
  ) {
    return {
      attachment: {
        payload: {
          buttons: [
            {
              type: FACEBOOK_BUTTONS.ACCOUNT_LINK,
              url: renderedUrl,
            },
          ],
          template_type: "button",
          text: fulfillmentText,
        },
        type: "template",
      },
    };
  }
}

export class FacebookAccountUnlink implements IDirective {
  public static platform: string = "facebook";
  public static key: string = "facebookAccountUnlink";

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const dialogflowReply = reply as FacebookReply;

    dialogflowReply.source = event.platform.name;
    dialogflowReply.payload.facebook = {
      attachment: {
        payload: {
          buttons: [
            {
              type: FACEBOOK_BUTTONS.ACCOUNT_UNLINK,
            },
          ],
          template_type: "button",
          text: dialogflowReply.fulfillmentText,
        },
        type: "template",
      },
    };
  }
}

export class FacebookSuggestionChips implements IDirective {
  public static platform: string = "facebook";
  public static key: string = "facebookSuggestionChips";

  constructor(public suggestions: string | string[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const suggestionChips: any[] = await this.getSuggestionChips(event);
    const dialogflowReply = reply as FacebookReply;

    dialogflowReply.source = event.platform.name;
    dialogflowReply.payload.facebook = {
      attachment: {
        payload: {
          buttons: suggestionChips,
          template_type: "button",
          text: dialogflowReply.fulfillmentText,
        },
        type: "template",
      },
    };
  }

  private async getSuggestionChips(
    event: IVoxaEvent,
  ): Promise<string[]> {
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

    return suggestionChips;
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

export enum FACEBOOK_BUTTONS {
  ACCOUNT_LINK = "account_link",
  ACCOUNT_UNLINK = "account_unlink",
  ELEMENT_SHARE = "element_share",
  GAME_PLAY = "game_play",
  PAYMENT = "payment",
  PHONE_NUMBER = "phone_number",
  POSTBACK = "postback",
  WEB_URL = "web_url",
}

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
  type: FACEBOOK_BUTTONS;
  url?: string;
  webviewHeightRatio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
}

export interface IFacebookElementTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  imageUrl?: string;
  subtitle?: string;
  title?: string;
  defaultActionUrl?: string;
  defaultActionFallbackUrl?: string;
  defaultMessengerExtensions?: boolean;
  defaultWebviewHeightRatio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
  sharable?: boolean;
  url?: string;
}

export interface IFacebookPayloadTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  elements?: IFacebookElementTemplate[];
  imageAspectRatio?: FACEBOOK_IMAGE_ASPECT_RATIO;
  sharable?: boolean;
  text?: string;
  topElementStyle?: FACEBOOK_TOP_ELEMENT_STYLE;
}

export interface IVoxaFacebookGenericButtonTemplate {
  fallback_url?: string;
  messenger_extensions?: boolean;
  payload?: string;
  title: string;
  type: FACEBOOK_BUTTONS;
  url?: string;
  webview_height_ratio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
}

export interface IVoxaFacebookElementTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  default_action?: {
    fallback_url?: string;
    messenger_extensions?: boolean;
    type?: FACEBOOK_BUTTONS;
    url?: string;
    webview_height_ratio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
  };
  image_url?: string;
  subtitle?: string;
  title?: string;
  sharable?: boolean;
  url?: string;
}

export interface IVoxaFacebookPayloadTemplate {
  buttons?: IFacebookGenericButtonTemplate[];
  elements?: IFacebookElementTemplate[];
  image_aspect_ratio?: FACEBOOK_IMAGE_ASPECT_RATIO;
  sharable?: boolean;
  template_type: string;
  text?: string;
  top_element_style?: FACEBOOK_TOP_ELEMENT_STYLE;
}

export const FacebookButtonTemplate = createGenericTemplateDirective(
  "facebookButtonTemplate",
  "button",
);

export const FacebookCarousel = createGenericTemplateDirective(
  "facebookCarousel",
  "generic",
);

export const FacebookList = createGenericTemplateDirective(
  "facebookList",
  "list",
);

export const FacebookOpenGraphTemplate = createGenericTemplateDirective(
  "facebookOpenGraphTemplate",
  "open_graph",
);
