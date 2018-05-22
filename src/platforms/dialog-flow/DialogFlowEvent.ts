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

  constructor(event: any, context: any) {
    super(event, context);
    _.merge(this, {
      request: {
        locale: event.lang,
        type: "IntentRequest",
      },
    }, event);

    this.session = new DialogFlowSession(event);
    this.intent = new DialogFlowIntent(event);
    this.platform = "dialogFlow";
  }

  get user() {
    const userData = _.get(this, "originalRequest.data.user", {});
    if (_.get(this, "originalRequest.data.user.user_id")) {
      userData.userId = _.get(this, "originalRequest.data.user.user_id");
    }

    return userData;
  }

  get capabilities() {
    return _.map(_.get(this, "originalRequest.data.surface.capabilities"), "name");
  }
}
