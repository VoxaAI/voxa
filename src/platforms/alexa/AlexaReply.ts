import { OutputSpeech, Reprompt, Response, ResponseBody, Session, Template } from "alexa-sdk";
import * as _ from "lodash";
import { Model } from "../../Model";
import { toSSML } from "../../ssml";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { AlexaEvent } from "./AlexaEvent";

const SSML = "SSML";

export class AlexaReply implements IVoxaReply, ResponseBody {
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

  public async setSession(model: Model): Promise<void> {
    this.sessionAttributes = await model.serialize();
  }

  public terminate() {
    if (!this.response) {
      this.response = { };
    }

    this.response.shouldEndSession = true;
  }

  public get speech(): string {
    if (!!this.response && !!this.response.outputSpeech && !!this.response.outputSpeech.ssml) {
      return this.response.outputSpeech.ssml;
    }

    return "";
  }

  public get reprompt(): string {
    return _.get(this.response, "reprompt.outputSpeech.ssml", "");
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    const type = isPlain ? "PlainText" : "SSML";
    if (!this.response.outputSpeech) {
      this.response.outputSpeech = { type };
    }

    if (!("shouldEndSession" in this.response)) {
      this.response.shouldEndSession = false;
    }

    if (isPlain) {
      this.response.outputSpeech.ssml = undefined;
      this.response.outputSpeech.text = this.response.outputSpeech.text || "";
      this.response.outputSpeech.text = addToText(this.response.outputSpeech.text, statement);
    } else {
      this.response.outputSpeech.text = undefined;
      this.response.outputSpeech.ssml = this.response.outputSpeech.ssml || "<speak></speak>";
      this.response.outputSpeech.ssml = addToSSML(this.response.outputSpeech.ssml, statement);
    }
  }

  public addReprompt(statement: string) {
    if (!this.response.reprompt) {
      this.response.reprompt = {
        outputSpeech: {
          ssml: `<speak>${statement}</speak>`,
          type: "SSML",
        },
      };
    } else {
      this.response.reprompt.outputSpeech.ssml = `<speak>${statement}</speak>`;
    }
  }

  public clear() {
    this.response = {};
  }

  public hasDirective(type: string | RegExp): boolean {
    if (!this.hasDirectives) {
      return false;
    }

    const allDirectives = this.response.directives || [];
    if (this.response.card) {
      allDirectives.push({ type: "card", card: this.response.card });
    }

    return allDirectives.some((directive: any) => {
      if (_.isRegExp(type)) { return !!type.exec(directive.type); }
      if (_.isString(type)) { return type === directive.type; }
      throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
    });
  }
}
