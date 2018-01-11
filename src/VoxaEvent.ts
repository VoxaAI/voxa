"use strict";

import * as i18n from "i18next";
import * as _ from "lodash";

import { Model} from "./Model";

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
  public platform: string;

  constructor(event: any, context: any) {
    this.rawEvent = event;
    this.executionContext = context;
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
