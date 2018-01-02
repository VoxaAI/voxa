import * as _ from 'lodash';
import { IVoxaEvent, IVoxaIntent, IVoxaSession } from '../../VoxaEvent';
import { Model } from '../../Model';
import { TranslationFunction } from 'i18next';
import { Context } from 'actions-on-google/dialogflow-app';
import { IntentArgument } from 'actions-on-google/assistant-app';
import { StandardIntents } from './interfaces';

export class DialogFlowEvent extends IVoxaEvent {
  public _context: any;
  public _raw: any;

  public session: DialogFlowSession;
  public request: any;
  public type: string;
  public context: any;
  public intent: DialogFlowIntent;
  public model: Model;
  public t: TranslationFunction;

  constructor(event: any, context: any) {
    super(event, context);
    _.merge(this, {
      session: {
      },
      request: {
        locale: event.lang,
        type: 'IntentRequest',
      },
    }, event);

    this.session = new DialogFlowSession(event);
    this.intent = new DialogFlowIntent(event);
    this.type = 'dialogFlow';
  }

  get user() {
    return _.get(this, 'originalRequest.data.user');
  }
}

class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public contexts: Context[];
  public new: boolean;

  constructor(rawEvent: any) {
    this.contexts = rawEvent.result.contexts;
    this.new = false;
    this.attributes = this.getAttributes();
  }

  getAttributes() {
    if (!this.contexts) {
      return {};
    }
    const attributes = _(this.contexts)
      .map((context: any) => {
        const contextName = context.name;
        let contextParams: any;
        if (context.parameters[contextName]) {
          contextParams = context.parameters[contextName];
        } else {
          contextParams = context.parameters;
        }
        return [contextName, contextParams];
      })
      .fromPairs()
      .value();

    return attributes;
  }
}


class DialogFlowIntent implements IVoxaIntent {
  public name: string;
  public _raw: any;
  public params: any;

  constructor(rawEvent: any) {
    this._raw = rawEvent;

    if (rawEvent.result.resolvedQuery === 'actions_intent_OPTION') {
      this.name = 'actions.intent.OPTION';
    } else {
      this.name = rawEvent.result.metadata.intentName;
    }

    this.params = this.getParams();
  }

  getParams(): any {
    if (this._raw.resolvedQuery === 'actions_intent_OPTION') {
      const input: any = _.find(this._raw.originalRequest.data.inputs, input => input.intent == StandardIntents.OPTION);

      if (!input) {
        return {};
      }

      const args = _(input.arguments)
        .map((argument: IntentArgument) => [argument.name, argument.textValue])
        .fromPairs()
        .value();

      return args;
    }

    return this._raw.result.parameters;
  }
}
