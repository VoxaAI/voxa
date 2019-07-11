/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
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

import * as AWS from "aws-sdk";
import * as _ from "lodash";
import * as path from "path";
import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";

export interface IS3Persistence {
  aws?: AWS.S3.ClientConfiguration;
  bucketName?: string;
  pathPrefix?: string;
  s3Client?: AWS.S3;
}

let defaultConfig: IS3Persistence = {
  bucketName: '',
};

export function s3Persistence(voxaApp: VoxaApp, config: IS3Persistence) {
  const bucketName = config.bucketName || process.env.S3_PERSISTENCE_BUCKET;

  if (!bucketName) {
    throw Error("Missing bucketName");
  }

  defaultConfig = _.merge(defaultConfig, config);

  defaultConfig.bucketName = bucketName;
  defaultConfig.s3Client = config.s3Client || new AWS.S3(config.aws);
  defaultConfig.pathPrefix = config.pathPrefix || "";

  voxaApp.onRequestStarted(onRequestStarted);
  voxaApp.onBeforeReplySent(onBeforeReplySent);
}

async function onRequestStarted(voxaEvent: IVoxaEvent): Promise<IVoxaEvent> {
  try {
    const objectId = path.join(defaultConfig.pathPrefix as string, voxaEvent.user.userId);
    const getParams: AWS.S3.GetObjectRequest = {
      Bucket: defaultConfig.bucketName as string,
      Key: objectId,
    };
    let result: AWS.S3.GetObjectOutput = {};

    try {
      result = await (defaultConfig.s3Client as AWS.S3).getObject(getParams).promise();
    } catch (error) {
      if (error.code !== "NoSuchKey") {
        throw error;
      }
    }

    const body = result.Body ? result.Body.toString() : "{}";
    const data = JSON.parse(body);

    voxaEvent.log.debug("Data fetched:", { data });
    voxaEvent.model.user = data;
    return voxaEvent;
  } catch (error) {
    throw error;
  }
}

async function onBeforeReplySent(voxaEvent: IVoxaEvent, reply: IVoxaReply) {
  const objectId = path.join(defaultConfig.pathPrefix as string, voxaEvent.user.userId);

  const putParams: AWS.S3.PutObjectRequest = {
    Body: JSON.stringify(voxaEvent.model.user),
    Bucket: defaultConfig.bucketName as string,
    Key: objectId,
  };

  try {
    await (defaultConfig.s3Client as AWS.S3)
      .putObject(putParams)
      .promise();
  } catch (error) {
    throw error;
  }

  return reply;
}
