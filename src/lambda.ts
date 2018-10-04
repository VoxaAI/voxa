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

import { Context as AWSLambdaContext } from "aws-lambda";
import { TimeoutError } from "./errors";

export function timeout(
  context: AWSLambdaContext,
): { timerPromise: Promise<void>; timer: NodeJS.Timer | undefined } {
  const timeRemaining = context.getRemainingTimeInMillis();

  let timer: NodeJS.Timer | undefined;
  const timerPromise = new Promise<void>((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new TimeoutError());
    }, Math.max(timeRemaining - 500, 0));
  });

  return { timer, timerPromise };
}

export function isLambdaContext(context: any): context is AWSLambdaContext {
  if (!context) {
    return false;
  }

  return context.getRemainingTimeInMillis !== undefined;
}
