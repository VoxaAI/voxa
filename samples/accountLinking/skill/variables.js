'use strict';

exports.user = function user(model) {
  if (model.email) {
    return model.email;
  }

  return 'Unidentified user';
};
