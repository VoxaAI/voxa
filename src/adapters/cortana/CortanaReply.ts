import { AttachmentLayout, IAttachment, IChatConnectorAddress, IMessage, Keyboard, ReceiptCard, SigninCard, SuggestedActions } from "botbuilder";
import * as _ from "lodash";
import * as uuid from "uuid";
import { toSSML } from "../../ssml";
import { VoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";

export class CortanaReply extends VoxaReply {
  public voxaEvent: CortanaEvent;
  public toJSON(): any {
    const speak = toSSML(this.response.statements.join("\n"));
    const text = this.response.statements.join("\n");
    const inputHint = this.response.terminate ? "acceptingInput" : "expectingInput";

    const attachmentTypes = [
      ReceiptCard,
      Keyboard,
      SigninCard,
    ];

    const attachments: IAttachment[] = _(this.response.directives)
      .filter((directive) => !!directive.attachment)
      .map("attachment.data")
      .value();

    const suggestedActions: SuggestedActions = _(this.response.directives)
      .filter((directive) => !!directive.suggestedActions)
      .map("suggestedActions")
      .find();

    return {
      address: this.voxaEvent.rawEvent.address,
      agent: "Voxa",
      attachments,
      channelId: this.voxaEvent.rawEvent.address.channelId,
      conversation: {
        id: this.voxaEvent.session.sessionId,
      },
      from: {
        id: this.voxaEvent.rawEvent.address.bot.id,
      },
      id: uuid.v1(),
      inputHint,
      locale: this.voxaEvent.request.locale,
      recipient: {
        id: this.voxaEvent.user.id,
        name: this.voxaEvent.user.name,
      },
      replyToId: (this.voxaEvent.rawEvent.address as IChatConnectorAddress).id,
      source: this.voxaEvent.rawEvent.source,
      sourceEvent: "",
      speak,
      suggestedActions: suggestedActions ? suggestedActions.toSuggestedActions() : undefined,
      text,
      textFormat: "plain",
      timestamp: new Date().toISOString(),
      type: "message",
      user: {
        id: this.voxaEvent.rawEvent.address.user.id,
      },
    };
  }
}
