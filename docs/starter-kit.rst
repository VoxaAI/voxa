.. _starter-kit:

Starter Kit
=============

This project is designed to be a simple template for your new skills. With some well thought defaults that have proven useful when developing real life skills.

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
  │   ├── MainStateMachine.js
  │   ├── index.js
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

This is where your code to handle alexa events goes, you will usually have a State Machine definition, this will include :ref:`states <controllers>`, :ref:`middleware <statemachine-skill>` and a :ref:`Model <models>`, :ref:`views-and-variables`

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
  
Dependencies (install these first)
----------------------------------
1. If you are using node.js for the first time, install node:
  * Install `nvm <http://nvm.sh/>`_, ``curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash``, 
  * Install node 4.3, ``nvm install 4.3``

2. Install gulp globally,  ``npm install -g gulp``

3. Install `ngrok <https://ngrok.com/download>`_, and `add it to your local bin <https://gist.github.com/wosephjeber/aa174fb851dfe87e644e>`_

Running the project
---------------------

1. Clone the `voxa <https://github.com/mediarain/voxa>`_ repository 

2. Create a new skill project using the ``samples/starterKit`` directory as a basis

3. Make sure you're running node 4.3, this is easiest with `nvm <https://github.com/creationix/nvm>`_

4. In your skill directory, install node dependencies using ``npm install``

5. Create a ``config/local.json`` file using ``config/local.json.example`` as an example

6. Run the project with ``gulp watch``

7. At this point you should start ``ngrok http 3000`` and configure your skill in the Amazon Developer panel to use the ngrok https endpoint.
