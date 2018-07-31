'use strict';

const _ = require('lodash');

/*
 * The Gadget Controller interface enables your skill to control Echo Buttons
 */
class GadgetController {
  setAnimations(...animationArray) {
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

  setTriggerEvent(triggerEvent) {
    this.triggerEvent = triggerEvent;
    return this;
  }

  static getAnimationsBuilder() {
    return new AnimationsBuilder();
  }

  static getSequenceBuilder() {
    return new SequenceBuilder();
  }

  setLight(targetGadgets, triggerEventTimeMs) {
    return {
      type: 'GadgetController.SetLight',
      version: 1,
      targetGadgets,
      parameters: {
        triggerEvent: this.triggerEvent,
        triggerEventTimeMs,
        animations: this.animations,
      },
    };
  }
}

/*
 * This object contains a sequence of instructions to be performed in a specific order
 */
class AnimationsBuilder {
  constructor() {
    this.animation = {};
  }

  repeat(repeat) {
    this.animation.repeat = repeat;
    return this;
  }

  targetLights(targetLights) {
    this.animation.targetLights = targetLights;
    return this;
  }

  sequence(sequenceArray) {
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

  build() {
    return this.animation;
  }
}

/*
 * The animation steps to render in order
 */
class SequenceBuilder {
  constructor() {
    this.sequence = {};
  }

  duration(durationMs) {
    this.sequence.durationMs = durationMs;
    return this;
  }

  color(color) {
    this.sequence.color = color;
    return this;
  }

  blend(blend) {
    this.sequence.blend = blend;
    return this;
  }

  build() {
    return this.sequence;
  }
}

module.exports = GadgetController;


/*
 * For more information about the trigger event values, follow this link:
 * https://developer.amazon.com/docs/gadget-skills/gadgetcontroller-interface-reference.html#parameters
 */
module.exports.TRIGGER_EVENT_ENUM = {
  BUTTON_DOWN: 'buttonDown',
  BUTTON_UP: 'buttonUp',
  NONE: 'none',
};
