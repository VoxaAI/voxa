"use strict";

import * as _ from "lodash";
import { ITransition } from "../StateMachine";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { VoxaReply } from "../VoxaReply";

export function register(skill: VoxaApp) {
  skill.onRequestStarted((voxaEvent: IVoxaEvent) => {
    const fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.model.state", "entry");
    (voxaEvent as any).flow = [fromState];
  });

  skill.onAfterStateChanged((voxaEvent: IVoxaEvent, reply: VoxaReply, transition: ITransition) => {
    (voxaEvent as any).flow.push(transition.to);
    return transition;
  });
}
