import {
  BasicCard as ActionsOnGoogleBasicCard,
  BasicCardOptions,
  BrowseCarousel as ActionsOnGoogleBrowseCarousel,
  BrowseCarouselOptions,
  Carousel as ActionsOnGoogleCarousel,
  CarouselOptions,
  CompletePurchase as ActionsOnGoogleCompletePurchase,
  Confirmation as ActionsOnGoogleConfirmation,
  DateTime as ActionsOnGoogleDateTime,
  DateTimeOptions,
  DeepLink as ActionsOnGoogleDeepLink,
  DeepLinkOptions,
  DialogflowConversation,
  GoogleActionsTransactionsV3CompletePurchaseValueSpec,
  GoogleActionsV2TransactionDecisionValueSpec,
  GoogleActionsV2TransactionRequirementsCheckSpec,
  LinkOutSuggestion as ActionsOnGoogleLinkOutSuggestion,
  LinkOutSuggestionOptions,
  List as ActionsOnGoogleList,
  ListOptions,
  MediaResponse as ActionsOnGoogleMediaResponse,
  MediaResponseOptions,
  NewSurface as ActionsOnGoogleNewSurface,
  NewSurfaceOptions,
  Parameters,
  Permission as ActionsOnGooglePermission,
  PermissionOptions,
  Place as ActionsOnGooglePlace,
  RegisterUpdate as ActionsOnGoogleRegisterUpdate,
  RegisterUpdateOptions,
  RichResponse,
  SignIn as ActionsOnGoogleSignIn,
  SimpleResponse,
  Suggestions as ActionsOnGoogleSuggestions,
  Table as ActionsOnGoogleTable,
  TableOptions,
  TransactionDecision as ActionsOnGoogleTransactionDecision,
  TransactionRequirements as ActionsOnGoogleTransactionRequirements,
  UpdatePermission as ActionsOnGoogleUpdatePermission,
  UpdatePermissionOptions,
} from "actions-on-google";
import * as bluebird from "bluebird";
import * as _ from "lodash";
import {
  IDirective,
  IDirectiveClass,
  sampleOrItem,
  Say as BaseSay,
} from "../../../directives";
import { ITransition } from "../../../StateMachine";
import { IVoxaEvent } from "../../../VoxaEvent";
import { IVoxaReply } from "../../../VoxaReply";
import { EntityHelper } from "../../share";
import { DialogflowEvent } from "../DialogflowEvent";
import { DialogflowReply } from "../DialogflowReply";

abstract class DialogflowDirective<IOptions> {
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
  return class extends DialogflowDirective<IOptions> implements IDirective {
    public static platform: string = "google";
    public static key: string = key;

    constructor(public options: IOptions) {
      super(options, requiredCapability);
    }

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition?: ITransition,
    ): Promise<void> {
      if (!this.hasRequiredCapability(event)) {
        return;
      }

      const google = (reply as DialogflowReply).payload.google;
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
  return class extends DialogflowDirective<IOptions> implements IDirective {
    public static platform: string = "google";
    public static key: string = key;

    constructor(public options: IOptions) {
      super(options, requiredCapability);
    }

    public async writeToReply(
      reply: IVoxaReply,
      event: IVoxaEvent,
      transition?: ITransition,
    ): Promise<void> {
      if (!this.hasRequiredCapability(event)) {
        return;
      }

      const google = (reply as DialogflowReply).payload.google;
      if (!google.richResponse) {
        throw new Error(`A simple response is required before a ${key}`);
      }

      const question = await this.getQuestion(RichResponseItemClass, event);
      google.richResponse.add(question);
    }
  };
}

export const LinkOutSuggestion = createRichResponseDirective<
  LinkOutSuggestionOptions
>(ActionsOnGoogleLinkOutSuggestion, "dialogflowLinkOutSuggestion");

export const NewSurface = createSystemIntentDirective<NewSurfaceOptions>(
  ActionsOnGoogleNewSurface,
  "dialogflowNewSurface",
);

export const List = createSystemIntentDirective<string | ListOptions>(
  ActionsOnGoogleList,
  "dialogflowList",
  "actions.capability.SCREEN_OUTPUT",
);

export const Carousel = createSystemIntentDirective<string | CarouselOptions>(
  ActionsOnGoogleCarousel,
  "dialogflowCarousel",
  "actions.capability.SCREEN_OUTPUT",
);

export const AccountLinkingCard = createSystemIntentDirective<string>(
  ActionsOnGoogleSignIn,
  "dialogflowAccountLinkingCard",
);

export const Permission = createSystemIntentDirective<PermissionOptions>(
  ActionsOnGooglePermission,
  "dialogflowPermission",
);

export const DateTime = createSystemIntentDirective<DateTimeOptions>(
  ActionsOnGoogleDateTime,
  "dialogflowDateTime",
);

export const Confirmation = createSystemIntentDirective<string>(
  ActionsOnGoogleConfirmation,
  "dialogflowConfirmation",
);

export const DeepLink = createSystemIntentDirective<DeepLinkOptions>(
  ActionsOnGoogleDeepLink,
  "dialogflowDeepLink",
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
  "dialogflowPlace",
);

export const CompletePurchase = createSystemIntentDirective<
  GoogleActionsTransactionsV3CompletePurchaseValueSpec
>(ActionsOnGoogleCompletePurchase, "googleCompletePurchase");

export const TransactionDecision = createSystemIntentDirective<
  GoogleActionsV2TransactionDecisionValueSpec
>(ActionsOnGoogleTransactionDecision, "dialogflowTransactionDecision");

export const TransactionRequirements = createSystemIntentDirective<
  GoogleActionsV2TransactionRequirementsCheckSpec
>(ActionsOnGoogleTransactionRequirements, "dialogflowTransactionRequirements");

export const RegisterUpdate = createSystemIntentDirective<
  RegisterUpdateOptions
>(ActionsOnGoogleRegisterUpdate, "dialogflowRegisterUpdate");

export const UpdatePermission = createSystemIntentDirective<
  UpdatePermissionOptions
>(ActionsOnGoogleUpdatePermission, "dialogflowUpdatePermission");

export const BasicCard = createRichResponseDirective<string | BasicCardOptions>(
  ActionsOnGoogleBasicCard,
  "dialogflowBasicCard",
  "actions.capability.SCREEN_OUTPUT",
);

export const MediaResponse = createRichResponseDirective<MediaResponseOptions>(
  ActionsOnGoogleMediaResponse,
  "dialogflowMediaResponse",
  "actions.capability.AUDIO_OUTPUT",
);

export const Table = createRichResponseDirective<TableOptions>(
  ActionsOnGoogleTable,
  "dialogflowTable",
  "actions.capability.SCREEN_OUTPUT",
);

export const BrowseCarousel = createRichResponseDirective<
  BrowseCarouselOptions
>(
  ActionsOnGoogleBrowseCarousel,
  "dialogflowBrowseCarousel",
  "actions.capability.SCREEN_OUTPUT",
);

export class Suggestions implements IDirective {
  public static platform: string = "google";
  public static key: string = "dialogflowSuggestions";

  constructor(public suggestions: string | string[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let options = this.suggestions;

    if (_.isString(options)) {
      options = await event.renderer.renderPath(options, event);
    }

    const suggestions = new ActionsOnGoogleSuggestions(options);
    const google: any = (reply as DialogflowReply).payload.google;
    const richResponse = google.richResponse;
    richResponse.addSuggestion(suggestions);
  }
}

export interface IContextConfig {
  name: string;
  lifespan: number;
  parameters?: Parameters;
}

export class Context implements IDirective {
  public static platform: string = "google";
  public static key: string = "dialogflowContext";

  constructor(public contextConfig: IContextConfig) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    const conv: DialogflowConversation = (event as DialogflowEvent).dialogflow
      .conv;
    conv.contexts.set(
      this.contextConfig.name,
      this.contextConfig.lifespan,
      this.contextConfig.parameters,
    );
  }
}

export class Say extends BaseSay {
  public static key: string = "say";
  public static platform: string = "google";

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    const google = (reply as DialogflowReply).payload.google;
    let richResponse: RichResponse = google.richResponse;
    if (!richResponse) {
      richResponse = new RichResponse([]);
    }
    google.richResponse = richResponse;

    let viewPaths = this.viewPaths;
    if (_.isString(viewPaths)) {
      viewPaths = [viewPaths];
    }

    await bluebird.mapSeries(viewPaths, async (view: string) => {
      const statement = await event.renderer.renderPath(view, event);
      if (transition.dialogflowSplitSimpleResponses) {
        richResponse.add(new SimpleResponse(""));
      }
      reply.addStatement(sampleOrItem(statement, event.platform));
    });
  }
}

export class SessionEntity extends EntityHelper implements IDirective {
  public static key: string = "dialogflowSessionEntity";
  public static platform: string = "google";

  public viewPath?: any | any[];

  constructor(viewPath: any | any[]) {
    super();
    this.viewPath = viewPath;
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let entity: any = this.viewPath;

    entity = await this.getGenericEntity(entity, event, this.viewPath);

    entity = this.createSessionEntity(entity, Entity.platform, event);

    (reply as DialogflowReply).sessionEntityTypes = entity;
  }
}

export class Entity extends EntityHelper implements IDirective {
  public static key: string = "entities";
  public static platform: string = "google";

  public viewPath?: any | any[];

  constructor(viewPath: any | any[]) {
    super();
    this.viewPath = viewPath;
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let entity: any = this.viewPath;

    entity = await this.getGenericEntity(entity, event, this.viewPath);

    entity = this.createSessionEntity(entity, Entity.platform, event);

    (reply as DialogflowReply).sessionEntityTypes = entity;
  }
}
