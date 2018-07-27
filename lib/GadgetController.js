'use strict';

const _ = require('lodash');

class GadgetController {
  setAnimations(...animationArray) {
    this.animations = _.map(animationArray, (animation) => {
      if (animation instanceof AnimationsBuilder) {
        return animation.build();
      }

      return animation;
    });

    return this;
  }

  setTriggerEvent(triggerEvent) {
    this.triggerEvent = triggerEvent;
    return this;
  }

  getAnimationsBuilder() {
    return new AnimationsBuilder();
  }

  getSequenceBuilder() {
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
    this.animation.sequence = _.map(sequenceArray, (item) => {
      if (item instanceof SequenceBuilder) {
        return item.build();
      }

      return item;
    });

    return this;
  }

  build() {
    return this.animation;
  }
}

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
module.exports.TRIGGER_EVENT_ENUM = {
  BUTTON_DOWN: 'buttonDown',
  BUTTON_UP: 'buttonUp',
  NONE: 'none',
};
