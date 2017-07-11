'use strict';

const skill = require('../skill/MainStateMachine');
const expect = require('chai').expect;

describe('Skill', () => {
  it('should reply with Intent.Launch', () => {
    const event = {
      session: {
        application: {
          applicationId: '',
        },
      },
      request: {
        type: 'LaunchRequest',
      },
    };

    return skill.execute(event)
      .then((reply) => {
        expect(reply.toJSON().response.outputSpeech.ssml).to.equal('<speak>Welcome to your first podcast! In this example, you will have to include in the podcast.js file the URL for your mp3, hosted in a HTTPS server. Do you want to listen to the first audio Dance of the Sugar Plum?</speak>');
      });
  });

  it('should reply with audioPlayer directives', () => {
    const event = {
      context: {
        AudioPlayer: {
          offsetInMilliseconds: 15867,
          token: '{"index":0,"shuffle":0,"loop":1}',
          playerActivity: 'PLAYING',
        },
      },
      request: {
        type: 'AudioPlayer.PlaybackNearlyFinished',
        timestamp: '2017-02-17T17:59:07Z',
        locale: 'en-US',
        token: '{"index":0,"shuffle":0,"loop":1}',
        offsetInMilliseconds: 15867,
      },
    };

    return skill.execute(event)
      .then((reply) => {
        expect(reply.toJSON()).to.deep.equal({
          version: '1.0',
          sessionAttributes: {},
          response: {
            outputSpeech: undefined,
            shouldEndSession: true,
            card: undefined,
            directives: [{
              audioItem: {
                stream: {
                  offsetInMilliseconds: 0,
                  token: '{"index":1,"shuffle":0,"loop":1}',
                  url: 'https://www.dl-sounds.com/wp-content/uploads/edd/2017/01/Clair-de-Lune-preview.mp3',
                },
              },
              playBehavior: 'REPLACE_ENQUEUED',
              type: 'AudioPlayer.Play',
            },
            ] },
        });
      });
  });
});
