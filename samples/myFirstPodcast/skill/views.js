'use strict';

const views = (function views() {
  return {
    Intent: {
      Launch: {
        ask: 'Welcome to your first podcast! In this example, you will have to include in the podcast.js file the URL for your mp3, hosted in a HTTPS server. ' +
        'Do you want to listen to the first audio {audioTitle}?',
        reprompt: 'Do you want to listen to the first audio?',
      },
      PlayAudio: {
        tell: 'Excellent! Now, listen to {audioTitle}',
      },
      PreviousAudio: {
        tell: 'Previous audio was {audioTitle}. Let\'s listen to it one more time.',
      },
      NextAudio: {
        tell: 'Next audio is {audioTitle}',
      },
      LoopActivated: {
        tell: 'Loop mode is on. I will play this podcast forever until you stop it or deactivate the loop mode. <say-as interpret-as="interjection">yay!</say-as>',
      },
      LoopDeactivated: {
        tell: 'Loop mode is off',
      },
      ShuffleActivated: {
        tell: 'Shuffle mode is on. I will play next audio randomly.',
      },
      ShuffleDeactivated: {
        tell: 'Shuffle mode is off',
      },
      StartOver: {
        tell: 'Ok! Let\'s start listening to {audioTitle}.',
      },
      Resume: {
        tell: 'Excellent! You were listening to {audioTitle}. Let\'s continue.',
      },
      Pause: {
        tell: 'Ok. You can come back any time to the podcast. Just say: Alexa, resume. Or, Alexa, continue.',
      },
      Help: {
        ask: 'Come on! <say-as interpret-as="interjection">really</say-as>? <break time="1s"/> <say-as interpret-as="interjection">nah</say-as>. ' +
        '<say-as interpret-as="interjection">just kidding</say-as> <break time="0.5s"/>. With this example you will be able to implement a podcast, and add features like: ' +
        'loop and shuffle, as well as playing the next and previous audio. So, do you want to listen to the first audio {audioTitle}?',
        reprompt: 'Do you want to listen to the first audio?',
      },
      Exit: {
        tell: 'Ok, goodbye.',
      },
    },
  };
}());
module.exports = views;
