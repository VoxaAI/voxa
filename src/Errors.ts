import { IVoxaEvent } from './VoxaEvent';

class UnhandledState extends Error {
  public event: IVoxaEvent;
  public fromState: string;
  public transition: any;

  constructor(voxaEvent: IVoxaEvent, transition: any, fromState: string) {
    let message: string;
    if (voxaEvent.intent) {
      message = `${voxaEvent.intent.name} went unhandled on ${fromState} state`;
    } else {
      message = `State machine went unhandled on ${fromState} state`;
    }

    super(message);
    this.event = voxaEvent;
    this.fromState = fromState;
    this.transition = transition;
  }
}

class UnknownState extends Error {
  public state: string;

  constructor(state: string) {
    const message = `Unknown state ${state}`;
    super(message);
    this.state = state;
  }
}

class UnknownRequestType extends Error {
  public requestType: string;

  constructor(requestType: string) {
    const message = `Unkown request type: ${requestType}`;
    super(message);
    this.requestType = requestType;
  }
}

class OnSessionEndedError extends Error {
  public requestType: string;

  constructor(errorOnSession: any) {
    if (errorOnSession instanceof Object && errorOnSession.constructor === Object) {
      errorOnSession = JSON.stringify(errorOnSession, null, 2);
    }
    const message = `Session ended with an error: ${errorOnSession}`;
    super(message);
    this.requestType = 'SessionEndedRequest';
  }
}

export { UnhandledState, UnknownState, UnknownRequestType, OnSessionEndedError };
