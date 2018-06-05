import { GoogleCloudDialogflowV2WebhookRequest  } from "actions-on-google";
import { TranslationFunction } from "i18next";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent, IVoxaSession } from "../../VoxaEvent";
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

  constructor(event: GoogleCloudDialogflowV2WebhookRequest, context: any) {
    super(event, context);
    _.merge(this, {
      request: {
        locale: _.get(event.queryResult, "languageCode"),
        type: "IntentRequest",
      },
    }, event);

    this.session = new DialogFlowSession(event);
    this.intent = new DialogFlowIntent(event);
    this.platform = "dialogFlow";
  }

  get user() {
    const userData = _.get(this, "originalDetectIntentRequest.payload.user", {});
    if (userData.user_id) {
      userData.userId = userData.user_id;
    }

    return userData;
  }

  get supportedInterfaces() {
    return _.map(_.get(this, "originalDetectIntentRequest.payload.surface.capabilities"), "name");
  }
}
