import { ITransition } from "../StateMachine";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";

export function register(skill: VoxaApp) {
  skill.onRequestStarted((voxaEvent: IVoxaEvent) => {
    const fromState = voxaEvent.session.new
      ? "entry"
      : voxaEvent.session.attributes.state || "entry";
    voxaEvent.session.outputAttributes.flow = [fromState];
  });

  skill.onAfterStateChanged(
    (voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition) => {
      voxaEvent.session.outputAttributes.flow =
        voxaEvent.session.outputAttributes.flow || [];
      voxaEvent.session.outputAttributes.flow.push(transition.to);
      return transition;
    },
  );
}
