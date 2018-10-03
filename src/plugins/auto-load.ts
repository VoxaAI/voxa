/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as _ from "lodash";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";

let defaultConfig: any = {};

export function autoLoad(skill: VoxaApp, config: any) {
  if (!config.adapter) {
    throw Error("Missing adapter");
  }

  if (!_.isFunction(config.adapter.get)) {
    throw Error("No get method to fetch data from");
  }

  defaultConfig = _.merge(defaultConfig, config);

  skill.onSessionStarted(
    async (voxaEvent: IVoxaEvent): Promise<IVoxaEvent> => {
      try {
        const data = await defaultConfig.adapter.get(voxaEvent.user);

        voxaEvent.log.debug("Data fetched:", { data });
        voxaEvent.model.user = data;
        return voxaEvent;
      } catch (error) {
        voxaEvent.log.error(error);
        throw error;
      }
    },
  );
}
