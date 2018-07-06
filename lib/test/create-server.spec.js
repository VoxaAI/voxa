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
const chai_1 = require("chai");
const debug = require("debug");
const http = require("http");
const portfinder = require("portfinder");
const AlexaPlatform_1 = require("../src/platforms/alexa/AlexaPlatform");
const create_server_1 = require("../src/platforms/create-server");
const VoxaApp_1 = require("../src/VoxaApp");
const views_1 = require("./views");
const log = debug("voxa");
describe("createServer", () => {
    let server;
    let port;
    before(() => __awaiter(this, void 0, void 0, function* () {
        const skill = new VoxaApp_1.VoxaApp({ views: views_1.views });
        const adapter = new AlexaPlatform_1.AlexaPlatform(skill, {});
        server = create_server_1.createServer(adapter);
        port = yield portfinder.getPortPromise();
        server.listen(port, () => log(`Listening on ${port}`));
    }));
    it("should return 404 on not GET", (done) => {
        http.get(`http://localhost:${port}`, (res) => {
            chai_1.expect(res.statusCode).to.equal(404);
            done();
        });
    });
    it("should return json response on POST", (done) => {
        const postData = JSON.stringify({
            request: "Hello World!",
        });
        const options = {
            headers: {
                "Content-Length": Buffer.byteLength(postData),
                "Content-Type": "application/json",
            },
            hostname: "localhost",
            method: "POST",
            path: "/",
            port,
        };
        const req = http.request(options, (res) => {
            chai_1.expect(res.statusCode).to.equal(200);
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                chai_1.expect(JSON.parse(data)).to.deep.equal({
                    response: {
                        outputSpeech: {
                            ssml: "<speak>An unrecoverable error occurred.</speak>", type: "SSML",
                        },
                        shouldEndSession: true,
                    },
                    version: "1.0",
                });
                done();
            });
        });
        req.write(postData);
        req.end();
    });
    after(() => {
        server.close();
    });
});
//# sourceMappingURL=create-server.spec.js.map