import * as debug from "debug";
import * as http from "http";
import { VoxaReply } from "./../VoxaReply";
import { VoxaAdapter } from "./VoxaAdapter";

const log: debug.IDebugger = debug("voxa");

function createServer(skill: VoxaAdapter<VoxaReply>): http.Server {
  return http.createServer((req, res) => {
    if (req.method !== "POST") {
      res.writeHead(404);
      return res.end();
    }

    const chunks: any[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      skill.execute(data)
        .then((reply) => {
          res.end(JSON.stringify(reply));
        })
        .catch((error: Error) => {
          log("error", error);
          res.end(JSON.stringify(error));
        });
    });

    return res.writeHead(200, { "Content-Type": "application/json" });
  });
}

export { createServer };
