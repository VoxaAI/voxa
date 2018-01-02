import * as _ from 'lodash';
import * as debug from 'debug';
import * as rp from 'request-promise';
import * as url from 'url';

import { ResponseBody, Response, OutputSpeech, Template } from 'alexa-sdk';

import { VoxaAdapter } from '../VoxaAdapter';
import { AlexaEvent } from './AlexaEvent';
import { AlexaReply } from './AlexaReply';
import { toSSML } from '../../ssml';
import { IVoxaEvent } from '../../VoxaEvent';
import { VoxaReply } from '../../VoxaReply';
import { VoxaApp } from '../../VoxaApp';
import { Transition } from '../../StateMachine';

const log:debug.IDebugger = debug('voxa');

const AlexaRequests = [
  'AudioPlayer.PlaybackStarted',
  'AudioPlayer.PlaybackFinished',
  'AudioPlayer.PlaybackNearlyFinished',
  'AudioPlayer.PlaybackStopped',
  'AudioPlayer.PlaybackFailed',
  'System.ExceptionEncountered',
  'PlaybackController.NextCommandIssued',
  'PlaybackController.PauseCommandIssued',
  'PlaybackController.PlayCommandIssued',
  'PlaybackController.PreviousCommandIssued',
  'AlexaSkillEvent.SkillAccountLinked',
  'AlexaSkillEvent.SkillEnabled',
  'AlexaSkillEvent.SkillDisabled',
  'AlexaSkillEvent.SkillPermissionAccepted',
  'AlexaSkillEvent.SkillPermissionChanged',
  'AlexaHouseholdListEvent.ItemsCreated',
  'AlexaHouseholdListEvent.ItemsUpdated',
  'AlexaHouseholdListEvent.ItemsDeleted',
  'Display.ElementSelected',
];

export class AlexaAdapter extends VoxaAdapter<AlexaReply> {
  constructor(voxaApp: VoxaApp) {
    super(voxaApp);
    this.app.onAfterStateChanged((voxaEvent: AlexaEvent, reply: AlexaReply, transition: Transition) => AlexaAdapter.partialReply(voxaEvent, reply));
    _.forEach(AlexaRequests, requestType => voxaApp.registerRequestHandler(requestType));
  }

  async execute(rawEvent: any, context: any): Promise<ResponseBody> {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    const reply = <AlexaReply> await this.app.execute(alexaEvent, AlexaReply);
    return reply.toJSON();
  }


  /*
   * Sends a partial reply after every state change
   */
  static partialReply(event: AlexaEvent, reply: AlexaReply) {
    if (!_.get(event, 'context.System.apiEndpoint')) {
      return Promise.resolve(null);
    }

    if (reply.isYielding()) {
      return Promise.resolve(null);
    }

    const endpoint = url.resolve(event.context.System.apiEndpoint, '/v1/directives');
    const authorizationToken = event.context.System.apiAccessToken;
    const requestId = event.request.requestId;
    const speech = toSSML(reply.response.statements.join('\n'));

    if (!speech) {
      return Promise.resolve(null);
    }

    const body = {
      header: {
        requestId,
      },
      directive: {
        type: 'VoicePlayer.Speak',
        speech,
      },
    };

    log('apiRequest');
    log(body);

    return AlexaAdapter.apiRequest(endpoint, body, authorizationToken)
      .then(() => {
        reply.clear();
      });
  }

  static apiRequest(endpoint: string, body: any, authorizationToken: string): any {
    const requestOptions = {
      method: 'POST',
      uri: endpoint,
      body,
      json: true,
      auth: {
        bearer: authorizationToken,
      },
    };

    return rp(requestOptions);
  }
}
