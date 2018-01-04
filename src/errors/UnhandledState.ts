import { IVoxaEvent } from "../VoxaEvent";

export class UnhandledState extends Error {
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
