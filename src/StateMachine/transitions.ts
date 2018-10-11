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

export interface ITransition {
  [propname: string]: any;
  to?: string; // default to 'entry'
  flow?: string;
}

export function isTransition(object: any): object is ITransition {
  return object && "to" in object;
}

export function getStateName(transition: ITransition): string {
  if (_.isString(transition.to)) {
    return transition.to;
  }

  return "";
}

/**
 * A helper class for transitions. Users can return transitions as an object with various command keys.
 * For developer flexibility we allow that transition object to be vague.
 * This object wraps the ITransition and gives defaults helps interpret what the various toggles mean.
 */
export class SystemTransition implements ITransition {
  [propname: string]: any;
  public to!: string; // default to 'entry'
  public flow!: string;

  constructor(transition: ITransition) {
    Object.assign(this, transition);
    this.to = this.to || "die";

    if (!this.flow) {
      this.flow = this.to === "die" ? "terminate" : "continue";
    }
  }

  get shouldTerminate(): boolean {
    return this.flow === "terminate" || this.to === "die";
  }

  get shouldContinue(): boolean {
    return !!(this.flow === "continue" && this.to !== "die");
  }
}
