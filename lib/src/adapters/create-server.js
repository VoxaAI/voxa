"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const http = require("http");
const log = debug("voxa");
function createServer(skill) {
    return http.createServer((req, res) => {
        if (req.method !== "POST") {
            res.writeHead(404);
            return res.end();
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            const data = JSON.parse(Buffer.concat(chunks).toString());
            skill.execute(data)
                .then((reply) => {
                res.end(JSON.stringify(reply));
            })
                .catch((error) => {
                log("error", error);
                res.end(JSON.stringify(error));
            });
        });
        return res.writeHead(200, { "Content-Type": "application/json" });
    });
}
exports.createServer = createServer;
//# sourceMappingURL=create-server.js.map