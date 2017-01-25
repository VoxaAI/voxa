.. _request:

The Request Object
===================

The request object contains all the information from the Alexa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

request.model
-------------

The default middleware instantiates a ``Model`` and makes it available through ``request.model``

request.intent.params
----------------------

The request object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so ``{ slots: [{ name: 'Dish', value: 'Fried Chicken' }] }`` becomes ``{ Dish: 'Fried Chicken' }``
