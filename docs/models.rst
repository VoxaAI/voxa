.. _models:

Models
======

Models are the data structure that holds the current state of your application, the framework doesn't make many assumptions on it and only requires  have a ``fromRequest`` method that should initialize it based on the request session attributes and a ``serialize`` method that should return ``JSON.stringify`` able structure to then store in the session attributes

.. literalinclude:: ../lib/Model.js
