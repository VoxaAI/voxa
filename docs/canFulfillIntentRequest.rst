.. _canFulfillIntentRequest:

CanFulfillIntentRequest
=======================

Name-free interaction enables customers to interact with Alexa without invoking a specific skill by name, which helps facilitate greater interaction with Alexa because customers do not always know which skill is appropriate.

When Alexa receives a request from a customer without a skill name, such as "Alexa, play relaxing sounds with crickets," Alexa looks for skills that might fulfill the request. Alexa determines the best choice among eligible skills and hands the request to the skill.

To make your skill more discoverable for name-free interaction, you can implement the the `CanFulfillIntentRequest <https://developer.amazon.com/docs/custom-skills/quick-start-canfulfill-intent-request.html>`_ interface in your skill.

In Voxa, you can take advantage of this feature by following this example:

.. code-block:: javascript

  skill.onIntent('NameIntent', (alexaEvent) => {
    if (alexaEvent.request.isCanFulfillIntentRequest) {
      const canFulfillIntent = {
        canFulfill: 'YES',
        slots: {},
      };

      _.each(alexaEvent.intent.params, (value, slotName) => {
        canFulfillIntent.slots[slotName] = {
          canUnderstand: 'YES',
          canFulfill: 'YES',
        };
      });

      return { canFulfillIntent };
    }

    return { to: 'nextState' };
  });


Voxa adds the property `isCanFulfillIntentRequest`_ to the request object when it identifies a `CanFulfillIntentRequest`_ request comes in the body request. Then, it automatically transforms it to an `IntentRequest` request to redirect the flow to the intent coming in the request. Then you should verify if this variable exists to respond to the Alexa service wether you're going to fulfill the request or not.

If a skill has implemented canFulfillIntent according to the interface specification, the skill should be aware that the skill is not yet being asked to take action on behalf of the customer, and should not modify any state outside its scope, or have any observable interaction with its own calling functions or the outside world besides returning a value. Thus, the skill should not, at this point, perform any actions such as playing sound, turning lights on or off, providing feedback to the customer, committing a transaction, or making a state change.


Testing using ASK-CLI
=====================

There are 2 options to test this feature manually. The first one is using the `Manual JSON` section of the `Test` tab in the developer portal. And the other one, is to use the `ASK CLI <https://developer.amazon.com/docs/custom-skills/implement-canfulfillintentrequest-for-name-free-interaction.html#test-the-skill-using-ask-cli>`_ from Amazon.

You can just trigger this command in the console, and you'll get the result in your terminal:

.. code-block:: bash

  $ ask api invoke-skill --skill-id amzn1.ask.skill.[unique-value-here] --file /path/to/input/json --endpoint-region [endpoint-region-here]

