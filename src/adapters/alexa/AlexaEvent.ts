import * as _ from 'lodash';
import { IVoxaEvent, IVoxaIntent } from '../../VoxaEvent';
import * as alexa from 'alexa-sdk';
import { Model } from '../../Model';
import { i18n, TranslationFunction } from 'i18next';
import { IntentRequest, SlotValue } from 'alexa-sdk';

export interface AlexaRequest extends alexa.RequestBody<alexa.Request> {
  context: any;
}

export class AlexaEvent extends IVoxaEvent {

  public session: any;
  public request: any;
  public type: string;
  public context: any;
  public intent: IVoxaIntent;
  public model: Model;
  public t: TranslationFunction;

  constructor(event: AlexaRequest , context: any) {
    super(event, context);
    this.session = event.session;
    this.request = event.request;
    this.context = event.context;
    this._context = context;
    this._raw = event;

    if (_.isEmpty(_.get(this, 'session.attributes'))) {
      _.set(this, 'session.attributes', {});
    }

    if (_.get(event, 'request.type') === 'LaunchRequest') {
      this.intent = new Intent({ name: 'LaunchIntent', slots: {} });
      this.request.type = 'IntentRequest';
    } else if (_.get(event, 'request.type') === 'Display.ElementSelected') {
      this.intent = new Intent({ name: 'DisplayElementSelected', slots: {} });
      this.request.type = 'IntentRequest';
    } else {
      this.intent = new Intent(this.request.intent);
    }

    this.type = 'alexa';
  }

  get user() {
    return _.get(this, 'session.user') || _.get(this, 'context.System.user');
  }

  get token() {
    return _.get(this, 'request.token');
  }
}

class Intent implements IVoxaIntent {
  public _raw: any;
  public name: string;
  public params: any;

  constructor(rawIntent: alexa.Intent) {
    this._raw = rawIntent;
    if (rawIntent) {
      this.name = rawIntent.name.replace(/^AMAZON./, '');
      this.params = _(rawIntent.slots)
        .map((s: SlotValue) => [s.name, s.value])
        .fromPairs()
        .value();
    } else {
      this.name = '';
      this.params = {};
    }
  }

}
