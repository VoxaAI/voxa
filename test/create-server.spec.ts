import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as debug from "debug";
import * as http from "http";
import * as portfinder from "portfinder";
import * as rp from "request-promise";
import { StatusCodeError } from "request-promise/errors";
import { AlexaPlatform } from "../src/platforms/alexa/AlexaPlatform";
import { createServer } from "../src/platforms/create-server";
import { VoxaApp } from "../src/VoxaApp";
import { views } from "./views";

const log: debug.IDebugger = debug("voxa");
use(chaiAsPromised);

describe("createServer", () => {
  let server: http.Server;
  let port: number;
  let adapter: AlexaPlatform;

  beforeEach(async () => {
    const skill = new VoxaApp({ views });
    adapter = new AlexaPlatform(skill, {});
  });

  afterEach(() => {
    server.close();
  });

  it("should return 404 on GET", async () => {
    server = createServer(adapter);
    port = await portfinder.getPortPromise();
    server.listen(port, () => log(`Listening on ${port}`));
    const options = {
      json: true,
      method: "GET",
      uri: `http://localhost:${port}/`,
    };

    await expect(rp(options)).to.eventually.be.rejectedWith(StatusCodeError, "404");
  });

  it("should return json response on POST", async () => {
    server = createServer(adapter);
    port = await portfinder.getPortPromise();
    server.listen(port, () => log(`Listening on ${port}`));

    const options = {
      body: {
        request: "Hello World",
      },
      json: true,
      method: "POST",
      uri: `http://localhost:${port}/`,
    };

    const response = await rp(options);

    expect(response).to.deep.equal({
      response: {
        outputSpeech: {
          ssml: "<speak>An unrecoverable error occurred.</speak>", type: "SSML",
        },
        shouldEndSession: true,
      },
      sessionAttributes: {},
      version: "1.0",
    });

  });

});
