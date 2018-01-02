import * as _ from 'lodash';

import { IMessage, IEvent, IIntentRecognizerResult, IConversationUpdate, IBotStorageData, IEntity } from 'botbuilder';
import { ICortanaEntity } from './CortanaInterfaces'
import { IVoxaEvent, IVoxaIntent } from '../../VoxaEvent';
import { Model } from '../../Model';
import { TranslationFunction } from 'i18next';
import { UniversalBot } from 'botbuilder';

export class CortanaIntent implements IVoxaIntent {
  public name: string;
  public params: any;
  public _raw: any;

  constructor(message: IMessage|IConversationUpdate) {
    this._raw = message;

    const intentEntity: ICortanaEntity | undefined = _.find(this._raw.entities, { type: 'Intent' });
    if (!intentEntity) {
      this.name = '';
      this.params = {};
    } else {
      if (intentEntity.name === 'Microsoft.Launch') {
        this.name = 'LaunchIntent';
        this.params = {};
      } else {
        this.name = intentEntity.name || '';
        this.params = {};
      }
    }

  }
}

export class CortanaEvent extends IVoxaEvent {
  public type: string;
  public session: any;
  public context: any;
  public model: Model;
  public t: TranslationFunction;
  public intent?: IVoxaIntent;

  public _context: any;
  public _raw: IMessage;

  constructor(message: IMessage, context: any, stateData: IBotStorageData, intent: IVoxaIntent|undefined) {
    super(message, context)
    this.type = 'cortana';
    this.session = {
      new: _.isEmpty(stateData.privateConversationData),
      attributes: stateData.privateConversationData || {},
      sessionId: _.get(message, 'address.conversation.id'),
    };

    this.context = {};

    if (intent) {
      this.intent = intent;
    } else {
      this.intent = new CortanaIntent(message);
    }
  }

  get user() {
    return _.merge(this._raw.address.user, { userId: this._raw.address.user.id });
  }

  get request() {
    let type = this._raw.type;
    if (type === 'endOfConversation') {
      type = 'SessionEndedRequest';
    }

    if (this.intent && this.intent.name) {
      type = 'IntentRequest';
    }

    var locale;
    if (this._raw.textLocale) {
      locale = this._raw.textLocale;
    } if (this._raw.entities) {
      const entity: any = _(this._raw.entities)
        .filter({ type: 'clientInfo'})
        .filter((e: any) => !!e.locale)
        .first()

      if (entity) {
        locale = entity.locale;
      }
    }

    return { type, locale };
  }

}

function isIConversationUpdate(message: IMessage | IConversationUpdate): message is IConversationUpdate {
  return (<IConversationUpdate>message).type === 'conversationUpdate';
}
