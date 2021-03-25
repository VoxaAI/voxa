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
import { ITransition } from "../StateMachine";
import { IVoxaIntentEvent } from "../VoxaEvent";

export type IStateHandler = (event: IVoxaIntentEvent) => Promise<ITransition>;

export class State {
  public intents: string[] = [];
  private handler: IStateHandler;

  /**
   * Creates a new State instance
   * @constructor
   * @param {string} name - Intent name
   * @param {IStateHandler | ITransition} handler - State handler function or transition Object
   * @param {string | string[]} [intents=[]] - Intent array
   * @param {string} [platform=core] - Platform's name
   */
  constructor(
    public name: string,
    handler: IStateHandler | ITransition,
    intents: string | string[] = [],
    public platform: string = "core",
  ) {
    if (_.isFunction(handler)) {
      this.handler = handler;
    } else {
      this.handler = this.getSimpleTransitionHandler(handler);
    }

    if (_.isString(intents)) {
      this.intents = [intents];
    } else {
      this.intents = intents;
    }
  }

  /**
   * Execute the handler function associated to the state
   * @param {IVoxaIntentEvent} voxaEvent - Voxa Event object
   * @return {Promise<ITransition>} - Return a promise resolving the Transition object
   */
  public async handle(voxaEvent: IVoxaIntentEvent): Promise<ITransition> {
    return this.handler(voxaEvent);
  }

  /**
   * Wraps the Transition object into a promise
   * @param transition
   * @protected
   * @return {Promise<IStateHandler>} - Returns a promise resolving the Transition Object
   */
  protected getSimpleTransitionHandler(transition: ITransition): IStateHandler {
    return async (voxaEvent: IVoxaIntentEvent) => _.cloneDeep(transition);
  }
}
