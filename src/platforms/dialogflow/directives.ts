import {
  BasicCard as ActionsOnGoogleBasicCard,
  BasicCardOptions,
  BrowseCarousel as ActionsOnGoogleBrowseCarousel,
  Carousel as ActionsOnGoogleCarousel,
  CarouselOptions,
  Confirmation as ActionsOnGoogleConfirmation,
  DateTime as ActionsOnGoogleDateTime,
  DateTimeOptions,
  DeepLink as ActionsOnGoogleDeepLink,
  DeepLinkOptions,
  GoogleActionsV2TransactionDecisionValueSpec,
  GoogleActionsV2TransactionRequirementsCheckSpec,
  List as ActionsOnGoogleList,
  ListOptions,
  MediaResponse as ActionsOnGoogleMediaResponse,
  NewSurface as ActionsOnGoogleNewSurface,
  NewSurfaceOptions,
  Permission as ActionsOnGooglePermission,
  PermissionOptions,
  Place as ActionsOnGooglePlace,
  RegisterUpdate as ActionsOnGoogleRegisterUpdate,
  RegisterUpdateOptions,
  SignIn as ActionsOnGoogleSignIn,
  Suggestions as ActionsOnGoogleSuggestions,
  Table as ActionsOnGoogleTable,
  TransactionDecision as ActionsOnGoogleTransactionDecision,
  TransactionRequirements as ActionsOnGoogleTransactionRequirements,
  UpdatePermission as ActionsOnGoogleUpdatePermission,
  UpdatePermissionOptions,
} from "actions-on-google";
import * as _ from "lodash";

import { IDirective, IDirectiveClass } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { DialogFlowReply } from "./DialogFlowReply";

abstract class DialogFlowDirective<IOptions> {
  constructor(public options: IOptions, public requiredCapability?: string) {}
  protected hasRequiredCapability(event: IVoxaEvent): boolean {
    if (!this.requiredCapability) {
      return true;
    }

    return _.includes(event.supportedInterfaces, this.requiredCapability);
  }

  protected async getQuestion(QuestionClass: any, event: IVoxaEvent) {
    if (_.isString(this.options)) {
      const options = await event.renderer.renderPath(this.options, event);
      return new QuestionClass(options);
    }
    return new QuestionClass(this.options);
  }
}

function createSystemIntentDirective<IOptions>(
  QuestionClass: any,
  key: string,
  requiredCapability?: string,
): IDirectiveClass {
  return class extends DialogFlowDirective<IOptions> implements IDirective {
    public static platform: string = "dialogflow";
    public static key: string = key;

    constructor(public options: IOptions) {
      super(options, requiredCapability);
    }

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      if (!this.hasRequiredCapability(event)) {
        return;
      }

      const google: any = (reply as DialogFlowReply).payload.google;
      const question = await this.getQuestion(QuestionClass, event);

      google.systemIntent = {
        data: question.inputValueData,
        intent: question.intent,
      };
    }
  };
}

function createRichResponseDirective<IOptions>(
  RichResponseItemClass: any,
  key: string,
  requiredCapability?: string,
): IDirectiveClass {
  return class extends DialogFlowDirective<IOptions> implements IDirective {
    public static platform: string = "dialogflow";
    public static key: string = key;

    constructor(public options: IOptions) {
      super(options, requiredCapability);
    }

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition: ITransition,
    ): Promise<void> {
      if (!this.hasRequiredCapability(event)) {
        return;
      }

      const google: any = (reply as DialogFlowReply).payload.google;
      if (!google.richResponse) {
        throw new Error(`A simple response is required before a ${key}`);
      }

      const question = await this.getQuestion(RichResponseItemClass, event);
      google.richResponse.add(question);
    }
  };
}

export const NewSurface = createSystemIntentDirective<NewSurfaceOptions>(
  ActionsOnGoogleNewSurface,
  "dialogFlowNewSurface",
);

export const List = createSystemIntentDirective<string | ListOptions>(
  ActionsOnGoogleList,
  "dialogFlowList",
  "actions.capability.SCREEN_OUTPUT",
);

export const Carousel = createSystemIntentDirective<string | CarouselOptions>(
  ActionsOnGoogleCarousel,
  "dialogFlowCarousel",
  "actions.capability.SCREEN_OUTPUT",
);

export const AccountLinkingCard = createSystemIntentDirective<string>(
  ActionsOnGoogleSignIn,
  "dialogFlowAccountLinkingCard",
);

export const Permission = createSystemIntentDirective<PermissionOptions>(
  ActionsOnGooglePermission,
  "dialogFlowPermission",
);

export const DateTime = createSystemIntentDirective<DateTimeOptions>(
  ActionsOnGoogleDateTime,
  "dialogFlowDateTime",
);

export const Confirmation = createSystemIntentDirective<string>(
  ActionsOnGoogleConfirmation,
  "dialogFlowConfirmation",
);

export const DeepLink = createSystemIntentDirective<DeepLinkOptions>(
  ActionsOnGoogleDeepLink,
  "dialogFlowDeepLink",
);

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

export const Place = createSystemIntentDirective<IPlaceOptions>(
  ActionsOnGooglePlace,
  "dialogFlowPlace",
);

export const TransactionDecision = createSystemIntentDirective<
  GoogleActionsV2TransactionDecisionValueSpec
>(ActionsOnGoogleTransactionDecision, "dialogFlowTransactionDecision");

export const TransactionRequirements = createSystemIntentDirective<
  GoogleActionsV2TransactionRequirementsCheckSpec
>(ActionsOnGoogleTransactionRequirements, "dialogFlowTransactionRequirements");

export const RegisterUpdate = createSystemIntentDirective<
  RegisterUpdateOptions
>(ActionsOnGoogleRegisterUpdate, "dialogFlowRegisterUpdate");

export const UpdatePermission = createSystemIntentDirective<
  UpdatePermissionOptions
>(ActionsOnGoogleUpdatePermission, "dialogFlowUpdatePermission");

export const BasicCard = createRichResponseDirective<string | BasicCardOptions>(
  ActionsOnGoogleBasicCard,
  "dialogFlowBasicCard",
  "actions.capability.SCREEN_OUTPUT",
);

export const MediaResponse = createRichResponseDirective<BasicCardOptions>(
  ActionsOnGoogleMediaResponse,
  "dialogFlowMediaResponse",
  "actions.capability.AUDIO_OUTPUT",
);

export const Table = createRichResponseDirective<BasicCardOptions>(
  ActionsOnGoogleTable,
  "dialogFlowTable",
  "actions.capability.SCREEN_OUTPUT",
);

export const BrowseCarousel = createRichResponseDirective<BasicCardOptions>(
  ActionsOnGoogleBrowseCarousel,
  "dialogFlowBrowseCarousel",
  "actions.capability.SCREEN_OUTPUT",
);

export class Suggestions implements IDirective {
  public static platform: string = "dialogflow";
  public static key: string = "dialogFlowSuggestions";

  constructor(public suggestions: string | string[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const suggestions = new ActionsOnGoogleSuggestions(this.suggestions);
    const google: any = (reply as DialogFlowReply).payload.google;
    const richResponse = google.richResponse;
    richResponse.addSuggestion(suggestions);
  }
}
