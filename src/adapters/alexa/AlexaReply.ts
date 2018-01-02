import * as _ from 'lodash';
import { VoxaReply } from '../../VoxaReply';
import { toSSML } from '../../ssml';
import { ResponseBody, Response, OutputSpeech, Template, Reprompt } from 'alexa-sdk';

const SSML = 'SSML';

export class AlexaReply extends VoxaReply {
  get supportsDisplayInterface() {
    return !!_.get(this, 'voxaEvent.context.System.device.supportedInterfaces.Display');
  }

  toJSON(): ResponseBody {
    const say = toSSML(this.response.statements.join('\n'));
    const reprompt = toSSML(this.response.reprompt);
    const directives: any[] = _.reject(this.response.directives, { type: 'card' });
    const card: any = _.find(this.response.directives, { type: 'card' });

    const alexaResponse: Response = { };

    if (say) {
      alexaResponse.outputSpeech = AlexaReply.createSpeechObject(say);
    }

    if (card) {
      alexaResponse.card = card.card;
    }

    if (this.voxaEvent.request.type !== 'SessionEndedRequest') {
        alexaResponse.shouldEndSession = !!this.response.terminate;
    }

    if (reprompt) {
      alexaResponse.reprompt = {
        outputSpeech: AlexaReply.createSpeechObject(reprompt),
      };
    }

    if (directives.length > 0) {
      alexaResponse.directives = directives;
    }


    const returnResult: ResponseBody = {
      version: '1.0',
      response: alexaResponse,
    };

    if (this.session && !_.isEmpty(this.session.attributes)) {
      returnResult.sessionAttributes = this.session.attributes;
    }

    return returnResult;
  }

  static createSpeechObject(speech: string|undefined): OutputSpeech {
    return {
      type: SSML,
      ssml: speech||'',
    };
  }
}
