.. _variables:

Variables
=========

Variables are the different values that can be interpolated in your responses, they're a dictionany of functions that when evaluated take your model as a parameter

.. code-block:: javascript

    const variables = {
      site: function site(model) {
        return Promise.resolve('example.com');
      },

      count: function count(model) {
        return model.count;
      },
    };

