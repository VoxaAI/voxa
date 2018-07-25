import {
  canfulfill,
  Response,
  ResponseEnvelope,
} from "ask-sdk-model";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";

export class AlexaReply implements IVoxaReply, ResponseEnvelope {
  public version = "1.0";
  public response: Response = {};
  public sessionAttributes: any;

  get hasMessages() {
    return !!this.response.outputSpeech;
  }

  get hasDirectives() {
    if (this.response.card) {
      return true;
    }

    if (!!this.response.directives) {
      return true;
    }

    return false;
  }

  get hasTerminated() {
    return !!this.response && !!this.response.shouldEndSession;
  }

  public async saveSession(event: IVoxaEvent): Promise<void> {
    this.sessionAttributes = await event.model.serialize();
  }

  public terminate() {
    if (!this.response) {
      this.response = { };
    }

    this.response.shouldEndSession = true;
  }

  public get speech(): string {
    return _.get(this.response, "outputSpeech.ssml", "");
  }

  public get reprompt(): string {
    return _.get(this.response, "reprompt.outputSpeech.ssml", "");
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (!("shouldEndSession" in this.response)) {
      this.response.shouldEndSession = false;
    }

    let ssml: string = _.get(this.response, "outputSpeech.ssml", "<speak></speak>");
    ssml = addToSSML(ssml, statement);
    this.response.outputSpeech = {
      ssml,
      type: "SSML",
    };
  }

  public addReprompt(statement: string, isPlain: boolean = false) {
    const type =  "SSML";
    let ssml: string = _.get(this.response.reprompt, "outputSpeech.ssml", "<speak></speak>");
    ssml = addToSSML(ssml, statement);
    this.response.reprompt = {
      outputSpeech : {
        ssml,
        type: "SSML",
      },
    };
  }

  public fulfillIntent(canFulfill: canfulfill.CanFulfillIntentValues) {
    this.response.card = undefined;
    this.response.reprompt = undefined;
    this.response.outputSpeech = undefined;

    if (!_.includes(["YES", "NO", "MAYBE"], canFulfill)) {
      this.response.canFulfillIntent = { canFulfill: "NO" };
    } else {
      this.response.canFulfillIntent = { canFulfill };
    }
  }

  public fulfillSlot(
    slotName: string,
    canUnderstand: canfulfill.CanUnderstandSlotValues,
    canFulfill: canfulfill.CanFulfillSlotValues) {
    if (!_.includes(["YES", "NO", "MAYBE"], canUnderstand)) {
      canUnderstand = "NO";
    }

    if (!_.includes(["YES", "NO"], canFulfill)) {
      canFulfill = "NO";
    }

    this.response.canFulfillIntent = this.response.canFulfillIntent || { canFulfill: "NO" };
    this.response.canFulfillIntent.slots = this.response.canFulfillIntent.slots || {};

    this.response.canFulfillIntent.slots[slotName] = { canUnderstand, canFulfill };
  }

  public clear() {
    this.response = {};
  }

  public hasDirective(type: string | RegExp): boolean {
    if (!this.hasDirectives) {
      return false;
    }

    let allDirectives: any[] = this.response.directives || [];
    if (this.response.card) {
      allDirectives = _.concat(allDirectives, { type: "card", card: this.response.card });
    }

    return allDirectives.some((directive: any) => {
      if (_.isRegExp(type)) { return !!type.exec(directive.type); }
      if (_.isString(type)) { return type === directive.type; }
      throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
    });
  }
}
