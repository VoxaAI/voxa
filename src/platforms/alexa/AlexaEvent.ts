import * as alexa from "alexa-sdk";
import { IntentRequest, SlotValue } from "alexa-sdk";
import { i18n, TranslationFunction } from "i18next";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { AlexaIntent } from "./AlexaIntent";

export interface IAlexaRequest extends alexa.RequestBody<alexa.Request> {
  context: any;
}

export interface ILaunchRequest extends alexa.RequestBody<alexa.LaunchRequest> {
  context: any;
}

export interface ISessionEndedRequest extends alexa.RequestBody<alexa.SessionEndedRequest> {
  context: any;
}

export class AlexaEvent extends IVoxaEvent {

  public session: any;
  public request: any;
  public platform: string;
  public context: any;
  public intent: IVoxaIntent;
  public model: Model;
  public t: TranslationFunction;

  constructor(event: IAlexaRequest , context?: any) {
    super(event, context);
    this.session = event.session;
    this.request = event.request;
    this.context = event.context;
    this.executionContext = context;
    this.rawEvent = event;

    if (_.isEmpty(_.get(this, "session.attributes"))) {
      _.set(this, "session.attributes", {});
    }

    if (_.get(event, "request.type") === "LaunchRequest") {
      this.intent = new AlexaIntent({ name: "LaunchIntent", slots: {} });
      this.request.type = "IntentRequest";
    } else if (_.get(event, "request.type") === "Display.ElementSelected") {
      this.intent = new AlexaIntent({ name: "DisplayElementSelected", slots: {} });
      this.request.type = "IntentRequest";
    } else {
      this.intent = new AlexaIntent(this.request.intent);
    }

    this.platform = "alexa";
  }

  get user() {
    return _.get(this, "session.user") || _.get(this, "context.System.user");
  }

  get token() {
    return _.get(this, "request.token");
  }
}
