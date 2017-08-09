'use strict';

const podcast = require('./data/podcast');
const debug = require('debug')('test');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (voxaEvent) => {
    voxaEvent.model.audioTitle = podcast[0].title;
    return { reply: 'Intent.Launch', to: 'optionsReview' };
  });

  skill.onIntent('AMAZON.HelpIntent', (voxaEvent) => {
    voxaEvent.model.audioTitle = podcast[0].title;
    return { reply: 'Intent.Help', to: 'optionsReview' };
  });

  skill.onState('optionsReview', (voxaEvent) => {
    if (voxaEvent.intent.name === 'AMAZON.YesIntent') {
      const index = 0;
      const shuffle = 0;
      const loop = 0;
      const offsetInMilliseconds = 0;
      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.PlayAudio', to: 'die', directives };
    } else if (voxaEvent.intent.name === 'AMAZON.NoIntent') {
      return { reply: 'Intent.Exit', to: 'die' };
    }
  });

  skill.onIntent('AMAZON.PreviousIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const offsetInMilliseconds = 0;
      let index = token.index - 1;

      if (shuffle === 1) {
        index = randomIntInc(0, podcast.length - 1);
      } else if (index === -1) {
        index = podcast.length - 1;
      }
      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);
      voxaEvent.model.audioTitle = podcast[index].title;

      return { reply: 'Intent.PreviousAudio', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.NextIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const offsetInMilliseconds = 0;
      let index = token.index + 1;

      if (shuffle === 1) {
        index = randomIntInc(0, podcast.length - 1);
      } else if (index === podcast.length) {
        index = 0;
      }

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      voxaEvent.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.NextAudio', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.LoopOnIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = 1;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }
      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.LoopActivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.LoopOffIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = 0;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.LoopDeactivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ShuffleOnIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = 1;
      const loop = token.loop;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.ShuffleActivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ShuffleOffIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = 0;
      const loop = token.loop;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.ShuffleDeactivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.StartOverIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = 0;

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      voxaEvent.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.StartOver', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ResumeIntent', (voxaEvent) => {
    if (voxaEvent.context) {
      const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;

      const url = podcast[index].url;
      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      voxaEvent.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.Resume', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onState('stop', () => {
    const directives = buildStopDirective();

    return { reply: 'Intent.Pause', to: 'die', directives };
  });

  skill['onAudioPlayer.PlaybackStarted']((voxaEvent) => {
    debug('onAudioPlayer.PlaybackStarted', JSON.stringify(voxaEvent, null, 2));
  });

  skill['onAudioPlayer.PlaybackFinished']((voxaEvent) => {
    debug('onAudioPlayer.PlaybackFinished', JSON.stringify(voxaEvent, null, 2));
  });

  skill['onAudioPlayer.PlaybackNearlyFinished']((voxaEvent, reply) => {
    const token = JSON.parse(voxaEvent.context.AudioPlayer.token);

    if (token.loop === 0) {
      return reply;
    }

    const shuffle = token.shuffle;
    const loop = token.loop;
    let index = token.index + 1;

    if (shuffle === 1) {
      index = randomIntInc(0, podcast.length - 1);
    } else if (index === podcast.length) {
      index = 0;
    }

    const directives = buildEnqueueDirective(podcast[index].url, index, shuffle, loop);
    return reply.append({ directives });
  });

  skill['onAudioPlayer.PlaybackStopped']((voxaEvent) => {
    debug('onAudioPlayer.PlaybackStopped', JSON.stringify(voxaEvent, null, 2));
  });

  skill['onAudioPlayer.PlaybackFailed']((voxaEvent) => {
    debug('onAudioPlayer.PlaybackFailed', JSON.stringify(voxaEvent, null, 2));
  });

  skill['onSystem.ExceptionEncountered']((voxaEvent) => {
    debug('onSystem.ExceptionEncountered', JSON.stringify(voxaEvent, null, 2));
  });
};

function createToken(index, shuffle, loop) {
  return JSON.stringify({ index, shuffle, loop });
}

function buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds) {
  const directives = {};
  directives.type = 'AudioPlayer.Play';
  directives.playBehavior = 'REPLACE_ALL';
  directives.token = createToken(index, shuffle, loop);
  directives.url = podcast[index].url;
  directives.offsetInMilliseconds = offsetInMilliseconds;

  return directives;
}

function buildEnqueueDirective(url, index, shuffle, loop) {
  const directives = {};
  directives.type = 'AudioPlayer.Play';
  directives.playBehavior = 'REPLACE_ENQUEUED';
  directives.token = createToken(index, shuffle, loop);
  directives.url = podcast[index].url;
  directives.offsetInMilliseconds = 0;

  return directives;
}

function buildStopDirective() {
  const directives = {};
  directives.type = 'AudioPlayer.Stop';

  return directives;
}

function randomIntInc(low, high) {
  return Math.floor((Math.random() * high) + low);
}
