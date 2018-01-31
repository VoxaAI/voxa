import { expect } from "chai";
import * as debug from "debug";
import * as http from "http";
import * as portfinder from "portfinder";
import { AlexaPlatform } from "../src/platforms/alexa/AlexaPlatform";
import { createServer } from "../src/platforms/create-server";
import { VoxaApp } from "../src/VoxaApp";
import { views } from "./views";

const log: debug.IDebugger = debug("voxa");

describe("createServer", () => {
  let server: http.Server;
  let port: number;

  before(async () => {
    const skill = new VoxaApp({ views });
    const adapter = new AlexaPlatform(skill, {});
    server = createServer(adapter);
    port = await portfinder.getPortPromise();
    server.listen(port, () => log(`Listening on ${port}`));
  });

  it("should return 404 on not GET", (done) => {
    http.get(`http://localhost:${port}`, (res) => {
      expect(res.statusCode).to.equal(404);
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
      expect(res.statusCode).to.equal(200);

      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        expect(JSON.parse(data)).to.deep.equal({
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
