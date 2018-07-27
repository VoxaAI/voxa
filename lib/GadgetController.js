'use strict';

const _ = require('lodash');

class GadgetController {
  setAnimations(...animationArray) {
    this.animations = this.animations || [];

    _.forEach(animationArray, (animation) => {
      if (animation instanceof AnimationsBuilder) {
        this.animations.push(animation.build());
      }

      this.animations.push(animation);
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
