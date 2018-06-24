import {
  BasicCard as ActionsOnGoogleBasicCard,
  BasicCardOptions,
  BrowseCarousel as ActionsOnGoogleBrowseCarousel,
  BrowseCarouselOptions,
  Carousel as ActionsOnGoogleCarousel,
  CarouselOptions,
  Confirmation as ActionsOnGoogleConfirmation,
  DateTime as ActionsOnGoogleDateTime,
  DateTimeOptions,
  DeepLink as ActionsOnGoogleDeepLink,
  DeepLinkOptions,
  DeliveryAddress as ActionsOnGoogleDeliveryAddress,
  GoogleActionsV2DeliveryAddressValueSpec,
  GoogleActionsV2PermissionValueSpecPermissions,
  GoogleActionsV2TransactionDecisionValueSpec,
  GoogleActionsV2TransactionRequirementsCheckSpec,
  GoogleCloudDialogflowV2IntentMessageListSelect,
  List as ActionsOnGoogleList,
  ListOptions,
  MediaObject,
  MediaResponse as ActionsOnGoogleMediaResponse,
  Permission as ActionsOnGooglePermission,
  PermissionOptions,
  Place as ActionsOnGooglePlace,
  RegisterUpdate as ActionsOnGoogleRegisterUpdate,
  RegisterUpdateOptions,
  RichResponse,
  SignIn as ActionsOnGoogleSignIn,
  Suggestions as ActionsOnGoogleSuggestions,
  Table as ActionsOnGoogleTable,
  TableOptions,
  TransactionDecision as ActionsOnGoogleTransactionDecision,
  TransactionRequirements as ActionsOnGoogleTransactionRequirements,
  UpdatePermission as ActionsOnGoogleUpdatePermission,
  UpdatePermissionOptions,
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
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowList";

  constructor(public listOptions: string|ListOptions) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
      return;
    }

    let listSelect;
    if (_.isString(this.listOptions)) {
      listSelect = new ActionsOnGoogleList(await event.renderer.renderPath(this.listOptions, event));
    } else {
      listSelect = new ActionsOnGoogleList(this.listOptions);
    }

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      data: listSelect.inputValueData,
      intent: listSelect.intent,
    };

  }
}

export class Carousel implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowCarousel";

  constructor(public carouselOptions: string|CarouselOptions) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
      return;
    }

    let carouselSelect;
    if (_.isString(this.carouselOptions)) {
      carouselSelect = new ActionsOnGoogleCarousel(await event.renderer.renderPath(this.carouselOptions, event));
    } else {
      carouselSelect = new ActionsOnGoogleCarousel(this.carouselOptions);
    }

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      data: carouselSelect.inputValueData,
      intent: carouselSelect.intent,
    };
  }
}

export class Suggestions implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowSuggestions";

  constructor(public suggestions: string|string[]) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const suggestions = new ActionsOnGoogleSuggestions(this.suggestions);
    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.addSuggestion(suggestions);
  }
}

export class BasicCard implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowBasicCard";

  public viewPath?: string;
  public basicCardOptions?: BasicCardOptions;

  constructor(viewPath: string|BasicCardOptions) {
    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.basicCardOptions = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
      return;
    }

    let basicCard;
    if (this.viewPath) {
      basicCard = new ActionsOnGoogleBasicCard(await event.renderer.renderPath(this.viewPath, event));
    } else if (this.basicCardOptions) {
      basicCard = new ActionsOnGoogleBasicCard(this.basicCardOptions);
    }

    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.add(basicCard);
  }
}

export class AccountLinkingCard implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowAccountLinkingCard";

  public constructor(public context?: string) {}

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    (reply as DialogFlowReply).fulfillmentText = "login";
    const signIn = new ActionsOnGoogleSignIn(this.context);

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      data: signIn.inputValueData,
      intent: signIn.intent,
    };
}
}

export class MediaResponse implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowMediaResponse";

  public constructor(public mediaObject: MediaObject) { }

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

export class Permission implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowPermission";

  public constructor(public permissionOptions: PermissionOptions) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    (reply as DialogFlowReply).fulfillmentText = "login";
    const permission = new ActionsOnGooglePermission(this.permissionOptions);

    const google: any = (reply as DialogFlowReply).payload.google;
    google.systemIntent = {
      data: permission.inputValueData,
      intent: permission.intent,
    };
  }
}

export class DateTime implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowDateTime";

  constructor(public dateTimeOptions: DateTimeOptions) {}

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const dateTime = new ActionsOnGoogleDateTime(this.dateTimeOptions);
    google.systemIntent = {
      data: dateTime.inputValueData,
      intent: dateTime.intent,
    };

  }
}

export class Confirmation implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowConfirmation";

  constructor(public prompt: string) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const confirmation = new ActionsOnGoogleConfirmation(this.prompt);

    google.systemIntent = {
      data: confirmation.inputValueData,
      intent: confirmation.intent,
    };

  }
}

export class DeepLink implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowDeepLink";

  constructor(public deepLinkOptions: DeepLinkOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const deepLink = new ActionsOnGoogleDeepLink(this.deepLinkOptions);

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

export class Place implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowPlace";

  constructor(public placeOptions: IPlaceOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const place = new ActionsOnGooglePlace(this.placeOptions);

    google.systemIntent = {
      data: place.inputValueData,
      intent: place.intent,
    };
  }
}

export class TransactionDecision implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowTransactionDecision";

  constructor(public transactionDecisionOptions: GoogleActionsV2TransactionDecisionValueSpec) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const transactionDecision = new ActionsOnGoogleTransactionDecision(this.transactionDecisionOptions);

    google.systemIntent = {
      data: transactionDecision.inputValueData,
      intent: transactionDecision.intent,
    };
  }
}

export class TransactionRequirements implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowTransactionRequirements";

  constructor(public transactionRequirementsOptions: GoogleActionsV2TransactionRequirementsCheckSpec) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const transactionRequirements = new ActionsOnGoogleTransactionRequirements(this.transactionRequirementsOptions);

    google.systemIntent = {
      data: transactionRequirements.inputValueData,
      intent: transactionRequirements.intent,
    };
  }
}

export class RegisterUpdate implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowRegisterUpdate";

  constructor(public registerUpdateOptions: RegisterUpdateOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const registerUpdate = new ActionsOnGoogleRegisterUpdate(this.registerUpdateOptions);

    google.systemIntent = {
      data: registerUpdate.inputValueData,
      intent: registerUpdate.intent,
    };
  }
}

export class UpdatePermission implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowUpdatePermission";

  constructor(public updatePermissionOptions: UpdatePermissionOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const google: any = (reply as DialogFlowReply).payload.google;
    const updatePermission = new ActionsOnGoogleUpdatePermission(this.updatePermissionOptions);

    google.systemIntent = {
      data: updatePermission.inputValueData,
      intent: updatePermission.intent,
    };
  }
}

export class Table implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowTable";

  constructor(public tableOptions: TableOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
      return;
    }

    const google: any = (reply as DialogFlowReply).payload.google;
    const table = new ActionsOnGoogleTable(this.tableOptions);
    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.add(table);
  }
}

export class BrowseCarousel implements IDirective {
  public static platform: string = "dialogFlow";
  public static key: string = "dialogFlowBrowseCarousel";

  constructor(public browseCarouselOptions: BrowseCarouselOptions) {}
  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    if (!_.includes(event.supportedInterfaces, "actions.capability.SCREEN_OUTPUT")) {
      return;
    }

    const google: any = (reply as DialogFlowReply).payload.google;
    const browseCarousel = new ActionsOnGoogleBrowseCarousel(this.browseCarouselOptions);
    const richResponse = _.get(reply, "payload.google.richResponse", new RichResponse());
    (reply as DialogFlowReply).payload.google.richResponse = richResponse.add(browseCarousel);
  }
}
