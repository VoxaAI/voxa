"use strict";

import * as i18n from "i18next";
import * as _ from "lodash";

import { Model} from "./Model";
import { Renderer } from "./renderers/Renderer";

export interface ITypeMap  {
  [x: string]: string;
}

export abstract class IVoxaEvent {
  public executionContext: any; // this would a lambda or azure function context
  public rawEvent: any; // the raw event as sent by the service
  public session!: IVoxaSession;
  public intent?: IVoxaIntent;
  public context: any;
  public request: any;
  public model!: Model;
  public t!: i18n.TranslationFunction;
  public renderer!: Renderer;
  public user!: IVoxaUser;
  public requestToIntent: ITypeMap = {};
  public requestToRequest: ITypeMap = {};
  public platform!: string;

  constructor(event: any, context: any) {
    this.rawEvent = _.cloneDeep(event);
    this.executionContext = context;
  }

  public abstract get supportedInterfaces(): string[];

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
  accessToken?: string;
  [key: string]: any;
}

export interface IVoxaIntent {
  rawIntent: any;
  name: string;
  params: any;
}

export interface IBag extends Object {
  [key: string]: any;
}

export interface IVoxaSession {
  // Session attributes that are attributes that are  inbound on the event.
  // These have been set by in the prior event by setting the outputAttributes.
  attributes: IBag;

  // Attributes that will be carried forward into the next event.
  outputAttributes: IBag;

  // True if this request is the first in the session.
  new: boolean;
  sessionId: string;
}
