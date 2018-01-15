"use strict";

import * as _ from "lodash";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";

const defaultConfig: any = {
  regex: /(.*)OnlyIntent$/,
  replace: "$1Intent",
};

export function register(app: VoxaApp, config: any): void {
  const pluginConfig = _.merge({}, defaultConfig, config);
  app.onIntentRequest((voxaEvent: IVoxaEvent) => {
    if (voxaEvent.intent) {
      const intentName = voxaEvent.intent.name;
      voxaEvent.intent.name = intentName.replace(pluginConfig.regex, pluginConfig.replace);
    }
  });
}
