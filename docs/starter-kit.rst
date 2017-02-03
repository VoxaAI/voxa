.. _starter-kit:

Starter Kit
=============

This project is designed to be a simple template for your new skills. With some well thought defaults that have proven useful when developing real life skills.

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
  └── www
      ├── infrastructure
      │   └── mount.js
      ├── routes
      │   ├── index.js
      │   └── skill.js
      └── server.js


config
--------------

By default your skill will have the following environments:

- local
- staging
- production

What environment you're is determined in the ``config/env.js`` module using the following code:

.. literalinclude:: ../samples/starterKit/config/env.js

skill
-----

This is where your code to handle alexa requests goes, you will usually have a State Machine definition, this will include :ref:`states <controllers>`, :ref:`middleware` and a :ref:`Model <models>`, :ref:`views-and-variables`

speechAssets
-------------

This should be a version controlled copy of your intent schema, sample utterrances and custom slots.

www
------

A standard express project configured to serve your skill in the ``/skill`` route. Combined with  `ngrok <https://ngrok.com/>`_ this is a great tool when developing or debugging.

test
-----

You write tests right?

gulpfile
----------

A gulp runner configured with a watch task that starts your express server and listens for changes to reload your application.

serverless.yml
-----------------

The serverless framework is a tool that helps you manage your lambda applications, assuming you have your AWS credentials setup properly this starter kit defines the very minimum needed so you can deploy your skill to lambda by just using

.. code-block:: bash
  
  $ sls deploy

