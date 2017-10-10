'use strict';

const VoxaApp = require('../VoxaApp');
const debug = require('debug')('voxa');
const createServer = require('./create-server');

class VoxaAdapter {
  constructor(voxaApp) {
    if (!(voxaApp instanceof VoxaApp)) {
      throw new Error(`${voxaApp} must be an instance of VoxaApp`);
    }

    this.app = voxaApp;
  }

  startServer(port) {
    port = port || 3000;
    createServer(this).listen(port, () => {
      debug(`Listening on port ${port}`);
    });
  }

  lambda() {
    return (event, context, callback) => this.execute(event, context)
      .then(result => callback(null, result))
      .catch(callback);
  }
}

module.exports = VoxaAdapter;
