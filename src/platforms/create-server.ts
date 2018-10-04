import * as http from "http";
import { VoxaPlatform } from "./VoxaPlatform";

export function createServer(skill: VoxaPlatform): http.Server {
  return http.createServer((req, res) => {
    if (req.method !== "POST") {
      res.writeHead(404);
      return res.end();
    }

    const chunks: any[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      try {
        const reply = await skill.execute(data);
        res.end(JSON.stringify(reply));
      } catch (error) {
        console.error(error);
        res.end(JSON.stringify(error));
      }
    });

    return res.writeHead(200, { "Content-Type": "application/json" });
  });
}
