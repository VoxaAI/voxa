'use strict';

exports.user = function user(model) {
  if (model.user) {
    return model.user.email;
  }

  return 'Unidentified user';
};
