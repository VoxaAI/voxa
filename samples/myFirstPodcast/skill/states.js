'use strict';

const podcast = require('./data/podcast');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (request) => {
    request.model.audioTitle = podcast[0].title;
    return { reply: 'Intent.Launch', to: 'optionsReview' };
  });

  skill.onIntent('AMAZON.HelpIntent', (request) => {
    request.model.audioTitle = podcast[0].title;
    return { reply: 'Intent.Help', to: 'optionsReview' };
  });

  skill.onState('optionsReview', (request) => {
    if (request.request.intent.name === 'AMAZON.YesIntent') {
      const index = 0;
      const shuffle = 0;
      const loop = 0;
      const offsetInMilliseconds = 0;

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.PlayAudio', to: 'die', directives };
    } else if (request.intent.name === 'AMAZON.NoIntent') {
      return { reply: 'Intent.Exit', to: 'die' };
    }
  });

  skill.onIntent('AMAZON.PreviousIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const offsetInMilliseconds = 0;
      let index = token.index - 1;

      if (shuffle === 1) {
        index = randomIntInc(0, podcast.length - 1);
      } else if (index === -1) {
        index = podcast.length - 1;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);
      request.model.audioTitle = podcast[index].title;

      return { reply: 'Intent.PreviousAudio', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.NextIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const offsetInMilliseconds = 0;
      let index = token.index + 1;

      if (shuffle === 1) {
        index = randomIntInc(0, podcast.length - 1);
      } else if (index === podcast.length) {
        index = 0;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      request.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.NextAudio', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.LoopOnIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = 1;
      const offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.LoopActivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.LoopOffIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = 0;
      const offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.LoopDeactivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ShuffleOnIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = 1;
      const loop = token.loop;
      const offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.ShuffleActivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ShuffleOffIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = 0;
      const loop = token.loop;
      const offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
      let index = token.index;

      if (index === podcast.length) {
        index = 0;
      }

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Intent.ShuffleDeactivated', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.StartOverIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = 0;

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      request.request.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.StartOver', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onIntent('AMAZON.ResumeIntent', (request) => {
    if (request.context) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;

      const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

      request.request.model.audioTitle = podcast[index].title;
      return { reply: 'Intent.Resume', to: 'die', directives };
    }

    return { reply: 'Intent.Exit', to: 'die' };
  });

  skill.onState('stop', (request) => {
    const directives = buildStopDirective();

    return { reply: 'Intent.Pause', to: 'die', directives };
  });

  skill['onAudioPlayer.PlaybackStarted']((request) => {
    console.log('onAudioPlayer.PlaybackStarted', JSON.stringify(request, null, 2));
  });

  skill['onAudioPlayer.PlaybackFinished']((request) => {
    console.log('onAudioPlayer.PlaybackFinished', JSON.stringify(request, null, 2));
  });

  skill['onAudioPlayer.PlaybackNearlyFinished']((request, reply) => {
    const token = JSON.parse(request.context.AudioPlayer.token);

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

  skill['onAudioPlayer.PlaybackStopped']((request) => {
    console.log('onAudioPlayer.PlaybackStopped', JSON.stringify(request, null, 2));
  });

  skill['onAudioPlayer.PlaybackFailed']((request) => {
    console.log('onAudioPlayer.PlaybackFailed', JSON.stringify(request, null, 2));
  });

  skill['onSystem.ExceptionEncountered']((request) => {
    console.log('onSystem.ExceptionEncountered', JSON.stringify(request, null, 2));
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
