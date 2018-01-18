import {
  IAttachment,
  IChatConnectorAddress,
  IIsAttachment,
  SuggestedActions,
} from "botbuilder";
import * as _ from "lodash";
import * as striptags from "striptags";
import * as uuid from "uuid";
import { toSSML } from "../../ssml";
import { VoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";
import { isAttachment, isSuggestedActions } from "./directives";

export class CortanaReply extends VoxaReply {
  public voxaEvent: CortanaEvent;
  public toJSON(): any {
    const speak = toSSML(this.response.statements.join("\n"));
    const text = striptags(this.response.statements.join("\n"));
    const inputHint: string = getInputHint(this);

    const jsonReply: any =  {
      address: this.voxaEvent.rawEvent.address,
      agent: "botbuilder",
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
      speak,
      text,
      textFormat: "plain",
      timestamp: new Date().toISOString(),
      type: "message",
      user: {
        id: this.voxaEvent.user.id,
      },
    };

    // AudioCards, HeroCard, etc
    const attachments = getAttachments(this);
    if (attachments.length) {
      jsonReply.attachments = attachments;
    }

    const suggestedActions = getSuggestedActions(this);
    if (suggestedActions) {
      jsonReply.suggestedActions = suggestedActions.toSuggestedActions();
    }

    return jsonReply;
  }
}

export function getInputHint(reply: VoxaReply) {
  // we're closing the session, cortana accepts input from other skills, etc
  if (reply.response.terminate) {
    return "acceptingInput";
  }

  // we just sent an ask and we're waiting for a reply
  if (reply.isYielding()) {
    return "expectingInput";
  }

  // this means we sent a partial reply, like a say
  return "ignoringInput";
}

export function getAttachments(reply: VoxaReply): any[] {
  return _(reply.response.directives)
    .filter({ type: "attachment" })
    .map("attachment")
    .map((at: IIsAttachment) => at.toAttachment())
    .filter(isAttachment)
    .value();
}

export function getSuggestedActions(reply: VoxaReply): SuggestedActions|undefined {
  return _(reply.response.directives)
    .filter({ type: "suggestedActions" })
    .map("suggestedActions")
    .filter(isSuggestedActions)
    .find();
}
