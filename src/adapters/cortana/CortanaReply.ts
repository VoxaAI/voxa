import * as _ from 'lodash';
import * as uuid from 'uuid';
import { VoxaReply } from '../../VoxaReply';
import { CortanaEvent } from './CortanaEvent';
import { toSSML } from '../../ssml';
import { IChatConnectorAddress, IMessage, IAttachment, SuggestedActions, AttachmentLayout, ReceiptCard, Keyboard, SigninCard } from 'botbuilder';

export class CortanaReply extends VoxaReply {
  public voxaEvent: CortanaEvent;
  toJSON(): any {
    const speak = toSSML(this.response.statements.join('\n'));
    const text = this.response.statements.join('\n');
    const inputHint = this.response.terminate ? 'acceptingInput' : 'expectingInput';

    const attachmentTypes = [
      ReceiptCard,
      Keyboard,
      SigninCard
    ];

    const attachments: IAttachment[] = _(this.response.directives)
      .filter(directive => !!directive.attachment)
      .map('attachment.data')
      .value();

    const suggestedActions: SuggestedActions = _(this.response.directives)
      .filter(directive => !!directive.suggestedActions)
      .map('suggestedActions')
      .find();

    console.log({ suggestedActions, attachments })

    return {
      inputHint,
      speak,
      text,
      type: 'message',
      agent: 'Voxa',
      source: this.voxaEvent._raw.source,
      sourceEvent: '',
      address: this.voxaEvent._raw.address,
      user: {
        id: this.voxaEvent._raw.address.user.id
      },
      id: uuid.v1(),
      timestamp: new Date().toISOString(),
      channelId: this.voxaEvent._raw.address.channelId,
      from: {
        id: this.voxaEvent._raw.address.bot.id,
      },
      conversation: {
        id: this.voxaEvent.session.sessionId,
      },
      recipient: {
        id: this.voxaEvent.user.id,
        name: this.voxaEvent.user.name,
      },
      textFormat: 'plain',
      locale: this.voxaEvent.request.locale,
      attachments,
      suggestedActions: suggestedActions ? suggestedActions.toSuggestedActions() : undefined,
      replyToId: (<IChatConnectorAddress>this.voxaEvent._raw.address).id,
    };
  }
}
