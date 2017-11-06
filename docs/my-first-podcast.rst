.. _my-first-podcast:

My First Podcast
==================

This project will help you build a podcast skill using the Audio directives template. You will be able to manage loop, shuffle requests as well as offer the user the possibility to start an audio over, pause, stop it or play the next or previous audio from a podcast list.

Directory Structure
---------------------

It has the following directory structure

.. code-block:: bash

  .
  ├── README.md
  ├── config
  │   ├── env.js
  │   ├── index.js
  │   ├── local.json.example
  │   ├── production.json
  │   └── staging.json
  ├── gulpfile.js
  ├── package.json
  ├── serverless.yml
  ├── services
  ├── skill
  │   ├── data
  │   │   └── podcast.js
  │   ├── MainStateMachine.js
  │   ├── index.js
  │   ├── states.js
  │   ├── variables.js
  │   └── views.js
  ├── speechAssets
  │   ├── IntentSchema.json
  │   ├── SampleUtterances.txt
  │   └── customSlotTypes
  ├── test
  ├── server.js


config
^^^^^^^^^^^^^^

By default your skill will have the following environments:

- local
- staging
- production

What environment you're is determined in the ``config/env.js`` module using the following code:

.. literalinclude:: ../samples/starterKit/config/env.js

skill
^^^^^

index.js
-----------------------
First file invoked by the lambda function, it initializes the state machine. You don't need to modify this file.


MainStateMachine.js
-----------------------
State machine is initialized with your model, views and variables. The class `states.js` will be in charge to handle all intents and events coming from Alexa. You don't need to modify this file.


states.js
-----------------------
All events and intents dispatched by the Alexa Voice Service to your skill are handled here. You can integrate any other module or API calls to third party services, call database resources or just simply reply a Hello or Goodbye response to the user.

The audio intents handled in this example are:

- AMAZON.CancelIntent
- AMAZON.LoopOffIntent
- AMAZON.LoopOnIntent
- AMAZON.NextIntent
- AMAZON.PauseIntent
- AMAZON.PreviousIntent
- AMAZON.RepeatIntent
- AMAZON.ResumeIntent
- AMAZON.ShuffleOffIntent
- AMAZON.ShuffleOnIntent
- AMAZON.StartOverIntent

You can track the values for loop, shuffle and current URL playing in the token property of the Alexa event in the path `voxaEvent.context.AudioPlayer.token`:

.. code-block:: javascript

	skill.onState('loopOff', (voxaEvent) => {
		if (voxaEvent.context) {
		  const token = JSON.parse(voxaEvent.context.AudioPlayer.token);
		  const shuffle = token.shuffle;
		  const loop = 0;
		  const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
		  let index = token.index;

		  if (index === podcast.length) {
		    index = 0;
		  }

		  const directives = buildPlayDirective(podcast[index].url, index, shuffle, loop, offsetInMilliseconds);

		  return { reply: 'Intent.LoopDeactivated', to: 'die', directives };
		}

		return { reply: 'Intent.Exit', to: 'die' };
	});

For any of these events you can make Alexa to speak after user's action with a reply object, optionally you can define the `die` state and pass through the directives object with either a `AudioPlayer.Play` or `AudioPlayer.Stop` directive type.

You can also handled the following playback request events:

- AudioPlayer.PlaybackStarted
- AudioPlayer.PlaybackFinished
- AudioPlayer.PlaybackStopped
- AudioPlayer.PlaybackNearlyFinished
- AudioPlayer.PlaybackFailed

You're not allowed to respond with a reply object since it's just an event most for trackign purposes, so it's optional to implement and you can do the following syntax:

.. code-block:: javascript

	skill['onAudioPlayer.PlaybackStarted']((voxaEvent) => {
		console.log('onAudioPlayer.PlaybackStarted', JSON.stringify(voxaEvent, null, 2));
	});

In case the user has activated the loop mode by dispatching the `AMAZON.LoopOnIntent` intent, you can implement a queue list in the `AudioPlayer.PlaybackNearlyFinished` this way:

.. code-block:: javascript

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

	function buildEnqueueDirective(url, index, shuffle, loop) {
		const directives = {};
		directives.type = 'AudioPlayer.Play';
		directives.playBehavior = 'REPLACE_ENQUEUED';
		directives.token = createToken(index, shuffle, loop);
		directives.url = podcast[index].url;
		directives.offsetInMilliseconds = 0;

		return directives;
	}


The `buildEnqueueDirective` function is in charge to build a directive object with a queue behavior, which will allow the skill to play the next audio as soon as the current one is finished.

This is where your code to handle alexa events goes, you will usually have a State Machine definition, this will include :ref:`states <controllers>`, :ref:`middleware <statemachine-skill>` and a :ref:`Model <models>`, :ref:`views-and-variables`.


data/podcast.js
-----------------------

A JSON variable with titles and urls for 5 audio examples hosted in a secure server, all along play a podcast which the user can shuffle or loop. You can modify this file with whatever other audio to add to your playlist. Keep in mind that they must be hosted in a secure server. The supported formats for the audio file include AAC/MP4, MP3, HLS, PLS and M3U. Bitrates: 16kbps to 384 kbps.


speechAssets
^^^^^^^^^^^^^

This should be a version controlled copy of your intent schema, sample utterrances and custom slots.

server.js
^^^^^^^^^

An http server for your skill configured to listen on port 3000, this should be used for development only.

services
^^^^^^^^

Just a common place to put models and libraries

test
^^^^^

You write tests right?

gulpfile
^^^^^^^^^^

A gulp runner configured with a watch task that starts your express server and listens for changes to reload your application.

serverless.yml
^^^^^^^^^^^^^^^^^

The serverless framework is a tool that helps you manage your lambda applications, assuming you have your AWS credentials setup properly this starter kit defines the very minimum needed so you can deploy your skill to lambda with the following command:

.. code-block:: bash

  $ sls deploy

Running the project
---------------------

1. Clone the `Audio Podcast Sample <https://github.com/mediarain/voxa-audiopodcast-sample>`_ repository

2. Make sure you're running node 6.10, this is easiest with `nvm <https://github.com/creationix/nvm>`_

3. Create a ``config/local.json`` file using ``config/local.json.example`` as an example

4. Run the project with ``gulp watch``

5. Create a skill in your Amazon Developer Portal account under the ALEXA menu.

6. Go to the interaction model tab and copy the intent schema and utterances from the the speechAssets folder.

7. At this point you should start ``ngrok http 3000`` and configure your skill in the Amazon Developer panel to use the ngrok https endpoint.
