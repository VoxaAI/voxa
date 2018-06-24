import("mocha");

import { expect } from "chai";

import { IVoxaEvent } from "../src/VoxaEvent";

class Event extends IVoxaEvent {
  public get supportedInterfaces() {
    return [];
  }

  public requestToIntent = {
    LaunchRequest: "LaunchIntent",
  };

  public requestToRequest = {
    CiaoRequest: "SessionEndedRequest",
  };

  public constructor(raw: any, context: any) {
    super(raw, context);
    this.request = raw.request;
  }
}

describe("VoxaEvent", () => {
  it("should map some requests to intents", () => {
    const raw = {
      request: {
        type: "LaunchRequest",
      },
    };
    const event = new Event(raw, {});
    event.mapRequestToIntent();
    expect(event.request.type).to.equal("IntentRequest");
    if (!event.intent) {
      throw new Error("event.intent is undefined");
    }
    expect(event.intent.name).to.equal("LaunchIntent");
  });

  it("should not map requests to intents if not specified", () => {
    const raw = {
      request: {
        type: "ExitRequest",
      },
    };
    const event = new Event(raw, {});
    event.mapRequestToIntent();
    expect(event.request.type).to.equal("ExitRequest");
    expect(event.intent).to.be.undefined;
  });

  it("should map requests to other requests if specified", () => {
    const raw = {
      request: {
        type: "CiaoRequest",
      },
    };
    const event = new Event(raw, {});
    event.mapRequestToRequest();
    expect(event.request.type).to.equal("SessionEndedRequest");
  });

  it("should map requests to other requests if specified", () => {
    const raw = {
      request: {
        type: "ExitRequest",
      },
    };
    const event = new Event(raw, {});
    event.mapRequestToRequest();
    expect(event.request.type).to.equal("ExitRequest");
  });
});
