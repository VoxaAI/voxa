import * as _ from 'lodash';
import { Template, Card } from 'alexa-sdk';
import { AlexaReply } from './AlexaReply';
import { AlexaEvent } from './AlexaEvent';

export function HomeCard(templatePath: string): Function {
  return async (reply: AlexaReply, event: AlexaEvent): Promise<void> => {
    const card = await reply.render(templatePath);
    if (_.filter(reply.response.directives, { type: 'card' }).length > 0) {
      throw new Error('At most one card can be specified in a response');
    }
    reply.response.directives.push({ card, type: 'card' })
  }
}

export function DialogDelegate(slots: any): Function {
  return (reply: AlexaReply, event: AlexaEvent): void => {
    reply.yield();
    reply.response.directives.push({
      type: "Dialog.Delegate",
      updatedIntent: {
        name: event.intent.name,
        confirmationStatus: '',
        slots: _.mapValues((v: any, k: string) => ({ name: k, value: v})),
      },
    })
  }
}

export function RenderTemplate(templatePath: string|Template, token: string): Function {
  return  async (reply: AlexaReply, event: AlexaEvent): Promise<void> => {
    if (!reply.supportsDisplayInterface) {
      return;
    }

    if (_.filter(reply.response.directives, { type: 'Display.RenderTemplate' }).length > 0) {
      throw new Error('At most one Display.RenderTemplate directive can be specified in a response');
    }

    if(_.isString(templatePath)) {
      const directive = await reply.render(templatePath, { token });
      reply.response.directives.push(directive)
    } else {
      reply.response.directives.push(templatePath)
    }
  }
}

export function AccountLinkingCard(): Function {
  return (reply: AlexaReply, event: AlexaEvent): void => {
    if (_.filter(reply.response.directives, { type: 'card' }).length > 0) {
      throw new Error('At most one card can be specified in a response');
    }

    reply.response.directives.push({ card: { type: 'LinkAccount' }, type: 'card' });
  }
}

export function Hint(templatePath: string): Function {
  return async (reply: AlexaReply, event: AlexaEvent): Promise<void> => {
    if (_.filter(reply.response.directives, { type: 'Hint' }).length > 0) {
      throw new Error('At most one Hint directive can be specified in a response');
    }

    if(_.isString(templatePath)) {
      const directive = await reply.render(templatePath);
      reply.response.directives.push(directive)
    } else {
      reply.response.directives.push(templatePath)
    }
  }
}


export function PlayAudio(url: string, token: string, offsetInMilliseconds: number, playBehavior: string='REPLACE'): Function {
  return (reply: AlexaReply, event: AlexaEvent) => {
    if (_.find(reply.response.directives, { type: 'AudioPlayer.Play' }) && _.find(reply.response.directives, { type: 'VideoApp.Launch' })) {
      throw new Error('Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response');
    }

    reply.response.directives.push({
      type: "AudioPlayer.Play",
      playBehavior,
      audioItem: { stream: { token, url, offsetInMilliseconds }}
    });
  }
}
