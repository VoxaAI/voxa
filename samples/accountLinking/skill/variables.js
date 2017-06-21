'use strict';

exports.user = function user(model) {
  if (model.user.email) {
    return model.user.email;
  }

  return 'Unidentified user';
};
