"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.execute(event, context);
                callback(null, result);
            }
            catch (error) {
                callback(error);
            }
        });
    }
}
exports.VoxaAdapter = VoxaAdapter;
//# sourceMappingURL=VoxaAdapter.js.map