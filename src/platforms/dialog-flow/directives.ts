import {
  Confirmation,
  DateTime,
  DateTimeOptions,
  DeepLink,
  DeepLinkOptions,
  GoogleActionsV2MediaObject,
  GoogleActionsV2PermissionValueSpecPermissions,
  GoogleActionsV2UiElementsBasicCard,
  GoogleActionsV2UiElementsCarouselSelect,
  GoogleCloudDialogflowV2IntentMessageListSelect,
  MediaResponse as ActionsOnGoogleMediaResponse,
  Permission,
  PermissionOptions,
  Place,
  RichResponse,
  SignIn,
  Suggestions as ActionsOnGoogleSuggestions,
} from "actions-on-google";
import * as _ from "lodash";

import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, IVoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { InputValueDataTypes, StandardIntents } from "./interfaces";

export class List implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowList";

  public viewPath?: string;
  public list?: GoogleCloudDialogflowV2IntentMessageListSelect;

  constructor(viewPath: string|GoogleCloudDialogflowV2IntentMessageListSelect) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let listSelect;
    if (this.viewPath) {
      listSelect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      listSelect = this.list;
    }

    const systemIntent = {
      data: {
        "@type": InputValueDataTypes.OPTION,
        listSelect,
      },
      intent: "actions.intent.OPTION",
    };

    (reply as DialogFlowReply).payload.google.systemIntent =  systemIntent;
  }
}

export class Carousel implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCarousel";

  public viewPath?: string;
  public list?: GoogleActionsV2UiElementsCarouselSelect;

  constructor(viewPath: string|GoogleActionsV2UiElementsCarouselSelect) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let carouselSelect;
    if (this.viewPath) {
      carouselSelect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      carouselSelect = this.list;
    }

    const systemIntent = {
      data: {
        "@type": InputValueDataTypes.OPTION,
        carouselSelect,
      },
      intent: "actions.intent.OPTION",
    };

    (reply as DialogFlowReply).payload.google.systemIntent =  systemIntent;
  }
}

export class Suggestions implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowSuggestions";

  public viewPath?: string;
  public suggestions?: string[];

  constructor(suggestions: string|string[]) {

    if (_.isString(suggestions)) {
      this.viewPath = suggestions;
    } else {
      this.suggestions = suggestions;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let suggestions;
    if (this.viewPath) {
      suggestions = await event.renderer.renderPath(this.viewPath, event);
    } else {
      suggestions = new ActionsOnGoogleSuggestions(this.suggestions || []);
    }

    console.log({ suggestions });
    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.addSuggestion(suggestions);
  }
}

export class BasicCard implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCard";

  public viewPath?: string;
  public basicCard?: GoogleActionsV2UiElementsBasicCard;

  constructor(viewPath: string|GoogleActionsV2UiElementsBasicCard) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.basicCard = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let basicCard;
    if (this.viewPath) {
      basicCard = await event.renderer.renderPath(this.viewPath, event);
    } else {
      basicCard = this.basicCard;
    }

    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.addBasicCard(basicCard);
  }
}

export class AccountLinkingCard implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowAccountLinkingCard";

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    (reply as DialogFlowReply).fulfillmentText = "login";
    const signIn = new SignIn();

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      inputValueData: signIn.inputValueData,
      intent: signIn.intent,
    };
}
}

export class MediaResponse implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowMediaResponse";

  public constructor(public mediaObject: GoogleActionsV2MediaObject) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const dialogFlowEvent = event as DialogFlowEvent;
    if (!_.includes(dialogFlowEvent.supportedInterfaces, "actions.capability.AUDIO_OUTPUT")) {
      return;
    }

    const mediaResponse = new ActionsOnGoogleMediaResponse(this.mediaObject);

    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    if (richResponse.items.length === 0) {
      throw new Error("MediaResponse requires another simple response first");
    }

    (reply as DialogFlowReply).payload.google.richResponse = richResponse.add(mediaResponse);
  }
}

export class PermissionsDirective implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowPermission";

  public constructor(public permissionOptions: PermissionOptions) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    (reply as DialogFlowReply).fulfillmentText = "login";
    const permission: Permission = new Permission(this.permissionOptions);

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      data: permission.inputValueData,
      intent: permission.intent,
    };
  }
}

export class DateTimeDirective implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCard";

  constructor(public dateTimeOptions: DateTimeOptions) {}

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const dateTime = new DateTime(this.dateTimeOptions);
    google.expectedInputs = {
      inputValueData: dateTime.inputValueData,
      intent: dateTime.intent,
    };

  }
}

export class ConfirmationDirective implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowConfirmation";

  constructor(public prompt: string) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const confirmation = new Confirmation(this.prompt);

    google.expectedInputs = {
      data: confirmation.inputValueData,
      intent: confirmation.intent,
    };

  }
}

export class DeepLinkDirective implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowDeepLink";

  constructor(public deepLinkOptions: DeepLinkOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const deepLink = new DeepLink(this.deepLinkOptions);

    google.systemIntent = {
      data: deepLink.inputValueData,
      intent: deepLink.intent,
    };
  }
}

export interface IPlaceOptions {
  /**
   * This is the initial response by location sub-dialog.
   * For example: "Where do you want to get picked up?"
   * @public
   */
  prompt: string;
  /**
   * This is the context for seeking permissions.
   * For example: "To find a place to pick you up"
   * Prompt to user: "*To find a place to pick you up*, I just need to check your location.
   *     Can I get that from Google?".
   * @public
   */
  context: string;
}

export class PlaceDirective implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowPlace";

  constructor(public placeOptions: IPlaceOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const place = new Place(this.placeOptions);

    google.systemIntent =           {
      data: place.inputValueData,
      intent: place.intent,
    };

  }
}
