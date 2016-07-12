/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

var Promise = require('bluebird')
  ;

var variables = {
  time: function time(data) {
    var today = new Date();
    var curHr = today.getHours()
    var time;

    if (curHr < 12) {
      time = 'Morning';
    } else if (curHr < 18) {
      time = 'Afternoon';
    } else {
      time = 'Evening';
    }
    
    return Promise.resolve(time);
  },
  site: function site(data) {
    return Promise.resolve('example.com');
  }
};

module.exports = variables;