'use strict';

import * as _ from 'lodash';
import * as i18n from 'i18next';

import { Model} from './Model';

export abstract class IVoxaEvent {
  _context: any;
  _raw: any;
  session: IVoxaSession;
  intent?: IVoxaIntent;
  context: any;
  request: any;
  model: Model;
  t: i18n.TranslationFunction;
  user: IVoxaUser;

  constructor(event: any, context: any) {
    this._raw = event;
    this._context = context;
  }
}

export interface IVoxaUser {
  id: string;
  name?: string;
}

export interface IVoxaIntent {
  _raw: any;
  name: string;
  params: any;
}

export interface IVoxaSession {
  attributes: any;
  new: boolean;
  sessionId?: string;
}
