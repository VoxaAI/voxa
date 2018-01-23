import { Card, Template } from "alexa-sdk";
import * as _ from "lodash";
import { directiveHandler } from "../../directives";
import { IVoxaEvent } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";

function onlyAlexa(target: ((reply: VoxaReply, event: IVoxaEvent) => Promise<void>)) {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (event.platform !== "alexa") {
      return;
    }

    return await target(reply, event);
  };
}

export function homeCard(templatePath: string): directiveHandler {
  return onlyAlexa(async (reply, event): Promise<void> => {
    const card = await reply.render(templatePath);
    if (reply.hasDirective("card")) {
      throw new Error("At most one card can be specified in a response");
    }

    reply.response.directives.push({ card, type: "card" });
  });
}

export function dialogDelegate(slots?: any): directiveHandler  {
  return onlyAlexa(async (reply, event): Promise<void> => {
    if (!event.intent) {
      throw new Error("An intent is required");
    }

    const directive: any = {
      type: "Dialog.Delegate",
    };

    if (slots) {
      const directiveSlots = _(slots)
        .map((value, key) => {
          const data: any = {
            confirmationStatus: "NONE",
            name: key,
          };

          if (value) {
            data.value = value;
          }

          return [key, data];
        })
        .fromPairs()
        .value();

      directive.updatedIntent = {
        confirmationStatus: "NONE",
        name: event.intent.name,
        slots: directiveSlots,
      };
    }

    reply.yield();
    reply.response.terminate = false;
    reply.response.directives.push(directive);
  });
}

export function renderTemplate(templatePath: string|Template, token: string): directiveHandler {
  return onlyAlexa(async (reply, event): Promise<void> => {
    if (!(reply as AlexaReply).supportsDisplayInterface) {
      return;
    }

    if (reply.hasDirective("Display.RenderTemplate")) {
      throw new Error("At most one Display.RenderTemplate directive can be specified in a response");
    }

    if (_.isString(templatePath)) {
      const directive = await reply.render(templatePath, { token });
      reply.response.directives.push(directive);
    } else {
      reply.response.directives.push(templatePath);
    }
  });
}

export function accountLinkingCard(): directiveHandler {
  return onlyAlexa(async (reply, event): Promise<void> => {
    if (reply.hasDirective("card")) {
      throw new Error("At most one card can be specified in a response");
    }

    reply.response.directives.push({ card: { type: "LinkAccount" }, type: "card" });
  });
}

export function hint(templatePath: string): directiveHandler {
  return onlyAlexa(async (reply, event): Promise<void> => {
    if (reply.hasDirective("Hint")) {
      throw new Error("At most one Hint directive can be specified in a response");
    }

    const text = await reply.render(templatePath);
    reply.response.directives.push({
      hint: {
        text,
        type: "PlainText",
      },
      type: "Hint",
    });
  });
}

export function playAudio(url: string, token: string, offsetInMilliseconds: number, playBehavior: string= "REPLACE"): directiveHandler {
  return onlyAlexa(async (reply, event): Promise<void> => {
    if (reply.hasDirective("VideoApp.Launch")) {
      throw new Error("Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response");
    }

    reply.response.directives.push({
      audioItem: { stream: { token, url, offsetInMilliseconds }},
      playBehavior,
      type: "AudioPlayer.Play",
    });
  });
}
