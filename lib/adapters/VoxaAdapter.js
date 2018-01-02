"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const create_server_1 = require("./create-server");
const log = debug("voxa");
class VoxaAdapter {
    constructor(voxaApp, config = {}) {
        this.app = voxaApp;
        this.config = config;
    }
    startServer(port) {
        port = port || 3000;
        create_server_1.createServer(this).listen(port, () => {
            debug(`Listening on port ${port}`);
        });
    }
    lambda() {
        return (event, context, callback) => this.execute(event, context)
            .then((result) => callback(null, result))
            .catch((error) => callback);
    }
}
exports.VoxaAdapter = VoxaAdapter;
//# sourceMappingURL=VoxaAdapter.js.map