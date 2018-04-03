"use strict";

import * as _ from "lodash";
import { ITransition } from "../StateMachine";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";

export function register(skill: VoxaApp) {
  skill.onRequestStarted((voxaEvent: IVoxaEvent) => {
    const fromState = voxaEvent.session.new ? "entry" : voxaEvent.model.state || "entry";
    voxaEvent.model.flow = [fromState];
  });

  skill.onAfterStateChanged((voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition) => {
    voxaEvent.model.flow = voxaEvent.model.flow || [];
    voxaEvent.model.flow.push(transition.to);
    return transition;
  });
}
