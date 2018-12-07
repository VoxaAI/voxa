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

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback as AWSLambdaCallback,
  Context as AWSLambdaContext,
} from "aws-lambda";
import {
  Context as AzureContext,
  HttpMethod as AzureHttpMethod,
  HttpRequest as AzureHttpRequest,
  HttpStatusCode as AzureHttpStatusCode,
} from "azure-functions-ts-essentials";
import * as http from "http";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import { v1 } from "uuid";
import { isAzureContext } from "../azure";
import { IDirectiveClass } from "../directives";
import { isLambdaContext } from "../lambda";
import { ITransition } from "../StateMachine";
import { IStateHandler } from "../StateMachine";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent, IVoxaEventClass } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";
import { createServer } from "./create-server";

export interface IVoxaPlatformConfig {
  logOptions?: LambdaLogOptions;
  test?: boolean; // is the platform running in test mode
  [key: string]: any;
}

export abstract class VoxaPlatform {
  public name!: string;

  protected abstract EventClass: IVoxaEventClass;

  constructor(public app: VoxaApp, public config: IVoxaPlatformConfig = {}) {
    _.forEach(this.getDirectiveHandlers(), (directive) =>
      app.directiveHandlers.push(directive),
    );

    _.forEach(this.getPlatformRequests(), (requestType) =>
      app.registerRequestHandler(requestType),
    );
  }

  public startServer(port?: number): Promise<http.Server> {
    if (!port) {
      port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    }

    return new Promise<http.Server>((resolve, reject) => {
      const server = createServer(this);
      server.listen(port, () => {
        console.log(`Listening on port ${port}`);
        resolve(server);
      });
    });
  }

  public async execute(
    rawEvent: any,
    context?: AWSLambdaContext | AzureContext,
  ): Promise<any> {
    const event = await this.getEvent(rawEvent, context);
    const reply = this.getReply(event);
    return this.app.execute(event, reply);
  }

  public lambda() {
    return async (
      event: any,
      context: AWSLambdaContext | AzureContext,
      callback: AWSLambdaCallback<any>,
    ) => {
      try {
        const result = await this.execute(event, context);
        return callback(null, result);
      } catch (error) {
        return callback(error);
      }
    };
  }

  public lambdaHTTP() {
    return async (
      event: APIGatewayProxyEvent,
      context: AWSLambdaContext,
      callback: AWSLambdaCallback<APIGatewayProxyResult>,
    ) => {
      try {
        const body = JSON.parse(event.body || "");
        const result = await this.execute(body, context);
        const response: APIGatewayProxyResult = {
          body: JSON.stringify(result),
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          statusCode: 200,
        };

        return callback(null, response);
      } catch (error) {
        callback(error);
      }
    };
  }

  public azureFunction() {
    return async (context: AzureContext, req: AzureHttpRequest) => {
      context.res = {
        body: {
          error: {
            message: `Method ${req.method} not supported.`,
            type: "not_supported",
          },
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
        status: AzureHttpStatusCode.MethodNotAllowed,
      };

      if (req.method === AzureHttpMethod.Post) {
        try {
          const body = await this.execute(req.body, context);
          context.res.body = body;
          context.res.status = AzureHttpStatusCode.OK;
        } catch (error) {
          context.res.body = error;
          context.res.status = AzureHttpStatusCode.InternalServerError;
        }
      }
    };
  }

  public onIntent(
    intentName: string,
    handler: IStateHandler | ITransition,
  ): void {
    this.app.onIntent(intentName, handler, this.name);
  }

  public onState(
    stateName: string,
    handler: IStateHandler | ITransition,
    intents: string[] | string = [],
  ): void {
    this.app.onState(stateName, handler, intents, this.name);
  }

  protected async getEvent(
    rawEvent: any,
    context?: AWSLambdaContext | AzureContext,
  ): Promise<IVoxaEvent> {
    const event = new this.EventClass(
      rawEvent,
      this.getLogOptions(context),
      context,
    );

    event.platform = this;

    return event;
  }

  protected abstract getReply(event: IVoxaEvent): IVoxaReply;

  protected getLogOptions(
    executionContext?: AWSLambdaContext | AzureContext,
  ): LambdaLogOptions {
    const logOptions: any = _.merge(
      {
        meta: {
          requestId: this.getRequestId(executionContext),
        },
      },
      this.app.config.logOptions,
    );

    if (_.includes(process.env.DEBUG, "voxa")) {
      logOptions.debug = true;
      logOptions.dev = true;
    }

    return logOptions;
  }

  protected getRequestId(
    executionContext?: AWSLambdaContext | AzureContext,
  ): string {
    if (isLambdaContext(executionContext)) {
      return executionContext.awsRequestId;
    }

    if (isAzureContext(executionContext) && executionContext.invocationId) {
      return executionContext.invocationId;
    }

    return v1();
  }

  protected abstract getDirectiveHandlers(): IDirectiveClass[];

  protected getPlatformRequests(): string[] {
    return [];
  }
}
