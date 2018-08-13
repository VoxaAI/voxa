import { DialogflowConversation, GoogleCloudDialogflowV2WebhookRequest  } from "actions-on-google";
import { TranslationFunction } from "i18next";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent, IVoxaSession, IVoxaUser } from "../../VoxaEvent";
import { DialogFlowIntent } from "./DialogFlowIntent";
import { DialogFlowSession } from "./DialogFlowSession";

export class DialogFlowEvent extends IVoxaEvent {
  public executionContext: any;
  public rawEvent: any;

  public session: DialogFlowSession;
  public request: any;
  public platform: string;
  public context: any;
  public intent: DialogFlowIntent;
  public conv: DialogflowConversation;

  constructor(event: GoogleCloudDialogflowV2WebhookRequest, context: any) {
    super(event, context);
    this.conv = new DialogflowConversation({
      body: event,
      headers: {},
    });

    this.request = {
        locale: _.get(event.queryResult, "languageCode"),
        type: "IntentRequest",
    };
    this.session = new DialogFlowSession(this.conv);
    this.intent = new DialogFlowIntent(this.conv);
    this.platform = "dialogFlow";
  }

  get user(): IVoxaUser {
    const response  = {
      accessToken: this.conv.user.access.token,
      userId: this.conv.user.id,
    };

    return _.merge({}, this.conv.user, response);
  }

  get supportedInterfaces(): string[] {
    let capabilities = _.map(this.conv.surface.capabilities.list, "name");
    capabilities = _.filter(capabilities);

    return capabilities as string[];
  }
}