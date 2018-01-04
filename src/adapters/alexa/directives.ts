import { Card, Template } from "alexa-sdk";
import * as _ from "lodash";
import { directiveHandler } from "../../VoxaReply";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";

export function HomeCard(templatePath: string): directiveHandler {
  return async (reply, event): Promise<void> => {
    const card = await reply.render(templatePath);
    if (_.filter(reply.response.directives, { type: "card" }).length > 0) {
      throw new Error("At most one card can be specified in a response");
    }
    reply.response.directives.push({ card, type: "card" });
  };
}

export function DialogDelegate(slots: any): directiveHandler  {
  return async (reply, event): Promise<void> => {
    if (!event.intent) {
      throw new Error("An intent is required");
    }

    reply.yield();
    reply.response.directives.push({
      type: "Dialog.Delegate",
      updatedIntent: {
        confirmationStatus: "",
        name: event.intent.name,
        slots: _.mapValues((v: any, k: string) => ({ name: k, value: v})),
      },
    });
  };
}

export function RenderTemplate(templatePath: string|Template, token: string): directiveHandler {
  return  async (reply, event): Promise<void> => {
    if (!(reply as AlexaReply).supportsDisplayInterface) {
      return;
    }

    if (_.filter(reply.response.directives, { type: "Display.RenderTemplate" }).length > 0) {
      throw new Error("At most one Display.RenderTemplate directive can be specified in a response");
    }

    if (_.isString(templatePath)) {
      const directive = await reply.render(templatePath, { token });
      reply.response.directives.push(directive);
    } else {
      reply.response.directives.push(templatePath);
    }
  };
}

export function AccountLinkingCard(): directiveHandler {
  return async (reply, event): Promise<void> => {
    if (_.filter(reply.response.directives, { type: "card" }).length > 0) {
      throw new Error("At most one card can be specified in a response");
    }

    reply.response.directives.push({ card: { type: "LinkAccount" }, type: "card" });
  };
}

export function Hint(templatePath: string): directiveHandler {
  return async (reply, event): Promise<void> => {
    if (_.filter(reply.response.directives, { type: "Hint" }).length > 0) {
      throw new Error("At most one Hint directive can be specified in a response");
    }

    if (_.isString(templatePath)) {
      const directive = await reply.render(templatePath);
      reply.response.directives.push(directive);
    } else {
      reply.response.directives.push(templatePath);
    }
  };
}

export function PlayAudio(url: string, token: string, offsetInMilliseconds: number, playBehavior: string= "REPLACE"): directiveHandler {
  return async (reply, event): Promise<void> => {
    if (_.find(reply.response.directives, { type: "AudioPlayer.Play" }) && _.find(reply.response.directives, { type: "VideoApp.Launch" })) {
      throw new Error("Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response");
    }

    reply.response.directives.push({
      audioItem: { stream: { token, url, offsetInMilliseconds }},
      playBehavior,
      type: "AudioPlayer.Play",
    });
  };
}
