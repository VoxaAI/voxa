'use strict';

module.exports = {
  SurfaceCapabilities,
  InputTypes,
};

const SurfaceCapabilities = {
  AUDIO_OUTPUT: 'actions.capability.AUDIO_OUTPUT',
  SCREEN_OUTPUT: 'actions.capability.SCREEN_OUTPUT',
};

const InputTypes = {
  /**
   * Unspecified.
   */
  UNSPECIFIED: 'UNSPECIFIED',
  /**
   * Input given by touch.
   */
  TOUCH: 'TOUCH',
  /**
   * Input given by voice (spoken).
   */
  VOICE: 'VOICE',
  /**
   * Input given by keyboard (typed).
   */
  KEYBOARD: 'KEYBOARD',
};
