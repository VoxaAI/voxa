.. _account-linking:

Account Linking
==================

This project is designed to be a simple template for your new skills with account linking. User's information is stored in a DynamoDB table so you can fetch it from the skill once users are authenticated.

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
  │   ├── model.js
  │   └── userStorage.js
  ├── skill
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
  └── www
      ├── infrastructure
      │   └── mount.js
      ├── routes
      │   ├── index.js
      │   └── skill.js
      └── server.js


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
All events and intents dispatched by the Alexa Voice Service to your skill are handled here. You can integrate any other module or API calls to third party services, call database resources or just simply reply a Hello or Goodbye response to the user. Before the very beginning of the lesson, you can implement the method `onRequestStarted` to fetch user's data from DynamoDB based on the accessToken coming from Alexa

.. code-block:: javascript

  skill.onRequestStarted((alexaEvent) => {
    if (!alexaEvent.session.user.accessToken) {
      return alexaEvent;
    }
    const storage = new UserStorage();

    return storage.get(alexaEvent.session.user.accessToken)
      .then((user) => {
        alexaEvent.model.user = user;
        return alexaEvent;
      });
  });

If the user is not authenticated you can also send a `LinkingAccount` card to the Alexa app so users know that before using your skill, they must get authenticated.

speechAssets
^^^^^^^^^^^^^

This should be a version controlled copy of your intent schema, sample utterrances and custom slots.

www
^^^^^^

A standard express project configured to serve your skill in the ``/skill`` route. Combined with  `ngrok <https://ngrok.com/>`_ this is a great tool when developing or debugging.


routes/index.js
-----------------------

You can handle all GET and POST requests for your account linking projects here. The most common one will be the POST call of the form after users hit the submit button. In this example, we gather user's information and create a row in DynamoDB for their information. For example you can generate an UUID to identify the users as the primary key and send it back to Alexa as the accessToken so you can easily fetch user's information later on.

.. code-block:: javascript

  router.post('/', (req, res, next) => {
    const md = new MobileDetect(req.headers['user-agent']);
    const db = new Storage();
    const email = req.body.email;
    const code = uuidV4().replace(/-/g, '');

    const params = {
      id: code,
      email,
    };

    return db.put(params)
      .then(() => {
        const redirect = `${req.query.redirect_uri}#state=${req.query.state}&access_token=${code}&token_type=Bearer`;

        if (md.is('AndroidOS')) {
          console.log(`redirecting android to: ${redirect}`);
          res.redirect(redirect);
        } else {
          console.log(`redirecting web to: ${redirect}`);
          res.render('auth/success', {
            page: 'success',
            title: 'Success',
            redirectUrl: redirect,
          });
        }
      })
      .catch(next);
  });

To finish the authentication process you have to make a redirection to the `redirect_uri` Amazon sends to our service. Since there could be 2 origins to redirect to, we create this URL dynamically; these endpoints could look like this:

- https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=xxx -> For United States store
- https://layla.amazon.com/spa/skill/account-linking-status.html?vendorId=xxxxxx -> For UK and Germany store

The other parameters to send are:

- access_token=YOUR-TOKEN
- token_type=Bearer

services
^^^^^^^^

Just a common place to put models and libraries


userStorage.js
-----------------------

Use this file as an example to handle database logic. Since we use DynamoDB for this example, we included 2 methods, a put and a get, so user's information get stored from the account linking project and get fetched from the alexa skill side. For reaching out DynamoDB you need some permissions for your lambda function. Make sure to grant your lambda function with a role with DynamoDB access.

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

1. Clone the `Voxa <https://github.com/mediarain/voxa>`_ repository

2. Create a new skill project using the ``samples/starterKit`` directory as a basis

3. Make sure you're running node 4.3, this is easiest with `nvm <https://github.com/creationix/nvm>`_

4. Create a ``config/local.json`` file using ``config/local.json.example`` as an example

5. Run the project with ``gulp watch``

6. At this point you should start ``ngrok http 3000`` and configure your skill in the Amazon Developer panel to use the ngrok https endpoint.
