import { services } from "ask-sdk-model";
import * as _ from "lodash";

/*
 * The Gadget Controller interface enables your skill to control Echo Buttons
 */
export class GadgetController {
  public static getAnimationsBuilder(): AnimationsBuilder {
    return new AnimationsBuilder();
  }

  public static getSequenceBuilder(): SequenceBuilder {
    return new SequenceBuilder();
  }

  public animations: any;
  public triggerEvent?: string;

  public setAnimations(...animationArray: any[]) {
    this.animations = this.animations || [];

    _.forEach(animationArray, (animation) => {
      if (animation instanceof AnimationsBuilder) {
        this.animations.push(animation.build());
      } else {
        this.animations.push(animation);
      }
    });

    return this;
  }

  public setTriggerEvent(triggerEvent: string): GadgetController {
    this.triggerEvent = triggerEvent;
    return this;
  }

  public setLight(targetGadgets: any, triggerEventTimeMs: number): any {
    return {
      parameters: {
        animations: this.animations,
        triggerEvent: this.triggerEvent,
        triggerEventTimeMs,
      },
      targetGadgets,
      type: "GadgetController.SetLight",
      version: 1,
    };
  }
}

/*
 * This object contains a sequence of instructions to be performed in a specific order
 */
export class AnimationsBuilder {
  public animation: any;

  constructor() {
    this.animation = {};
  }

  public repeat(repeat: number): AnimationsBuilder {
    this.animation.repeat = repeat;
    return this;
  }

  public targetLights(targetLights: any): AnimationsBuilder {
    this.animation.targetLights = targetLights;
    return this;
  }

  public sequence(sequenceArray: any): AnimationsBuilder {
    this.animation.sequence = this.animation.sequence || [];

    sequenceArray = _.map(sequenceArray, (item) => {
      if (item instanceof SequenceBuilder) {
        return item.build();
      }

      return item;
    });

    this.animation.sequence = _.concat(this.animation.sequence || [], sequenceArray);

    return this;
  }

  public build(): any {
    return this.animation;
  }
}

/*
 * The animation steps to render in order
 */
export class SequenceBuilder {
  public sequence: any;

  constructor() {
    this.sequence = {};
  }

  public duration(durationMs: number) {
    this.sequence.durationMs = durationMs;
    return this;
  }

  public color(color: string) {
    this.sequence.color = color;
    return this;
  }

  public blend(blend: boolean) {
    this.sequence.blend = blend;
    return this;
  }

  public build(): any {
    return this.sequence;
  }
}

/*
 * For more information about the trigger event values, follow this link:
 * https://developer.amazon.com/docs/gadget-skills/gadgetcontroller-interface-reference.html#parameters
 */
export const TRIGGER_EVENT_ENUM = {
  BUTTON_DOWN: "buttonDown",
  BUTTON_UP: "buttonUp",
  NONE: "none",
};
