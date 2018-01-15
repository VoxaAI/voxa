"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug");
var http = require("http");
var log = debug("voxa");
function createServer(skill) {
    return http.createServer(function (req, res) {
        if (req.method !== "POST") {
            res.writeHead(404);
            return res.end();
        }
        var chunks = [];
        req.on("data", function (chunk) { return chunks.push(chunk); });
        req.on("end", function () {
            var data = JSON.parse(Buffer.concat(chunks).toString());
            skill.execute(data)
                .then(function (reply) {
                res.end(JSON.stringify(reply));
            })
                .catch(function (error) {
                log("error", error);
                res.end(JSON.stringify(error));
            });
        });
        return res.writeHead(200, { "Content-Type": "application/json" });
    });
}
exports.createServer = createServer;
//# sourceMappingURL=create-server.js.map