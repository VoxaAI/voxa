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
const http = require("http");
function createServer(skill) {
    return http.createServer((req, res) => {
        if (req.method !== "POST") {
            res.writeHead(404);
            return res.end();
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(Buffer.concat(chunks).toString());
            try {
                const reply = yield skill.execute(data, {});
                res.end(JSON.stringify(reply));
            }
            catch (error) {
                console.error(error);
                res.end(JSON.stringify(error));
            }
        }));
        return res.writeHead(200, { "Content-Type": "application/json" });
    });
}
exports.createServer = createServer;
//# sourceMappingURL=create-server.js.map