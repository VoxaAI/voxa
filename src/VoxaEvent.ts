"use strict";

import * as i18n from "i18next";
import * as _ from "lodash";

import { Model} from "./Model";

export interface IRequestTypeMap  {
  [x: string]: string;
}

export abstract class IVoxaEvent {
  public executionContext: any;
  public rawEvent: any;
  public session: IVoxaSession;
  public intent?: IVoxaIntent;
  public context: any;
  public request: any;
  public model: Model;
  public t: i18n.TranslationFunction;
  public user: IVoxaUser;
  public requestToIntent: IRequestTypeMap = {};
  public requestToRequest: IRequestTypeMap = {};
  public platform: string;

  constructor(event: any, context: any) {
    this.rawEvent = event;
    this.executionContext = context;
  }

  public mapRequestToIntent(): void {
    const requestType = this.request.type;
    const intentName = this.requestToIntent[requestType];

    if (!intentName) {
      return;
    }

    _.set(this, "intent", {
      name: intentName,
      slots: {},
    });
    _.set(this, "request.type", "IntentRequest");
  }

  public mapRequestToRequest(): void {
    const requestType = this.request.type;
    const newRequestType = this.requestToRequest[requestType];

    if (!newRequestType) {
      return;
    }

    _.set(this, "request.type", newRequestType);
  }

}

export interface IVoxaUser {
  id: string;
  name?: string;
}

export interface IVoxaIntent {
  rawIntent: any;
  name: string;
  params: any;
}

export interface IVoxaSession {
  attributes: any;
  new: boolean;
  sessionId?: string;
}
