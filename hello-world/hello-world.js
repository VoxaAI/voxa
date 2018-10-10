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

require("source-map-support").install();
let voxa;
try {
  voxa = require("voxa");
} catch (err) {
  voxa = require("../src");
}

const VoxaApp = voxa.VoxaApp;
const DialogFlowPlatform = voxa.DialogFlowPlatform;
const AlexaPlatform = voxa.AlexaPlatform;

const views = require("./views.json");

const app = new VoxaApp({ views });
app.onIntent("input.welcome", {
  to: "LaunchIntent"
});

app.onIntent("LaunchIntent", {
  ask: "launch",
  to: "likesVoxa?",
  flow: "yield"
});

app.onBeforeReplySent(request => {
  if (request.platform.name === "dialogflow") {
    request.google.conv.user.storage = {};
  }
});

app.onState("likesVoxa?", request => {
  if (request.intent.name === "YesIntent") {
    return { tell: "doesLikeVoxa" };
  }

  if (request.intent.name === "NoIntent") {
    return { ask: "doesNotLikeVoxa" };
  }
});

const alexaSkill = new AlexaPlatform(app);

const dialogFlowAction = new DialogFlowPlatform(app);

module.exports = {
  alexaSkill,
  alexaLambdaHandler: alexaSkill.lambda(),
  alexaLambdaHTTPHandler: alexaSkill.lambdaHTTP(),
  dialogFlowAction: dialogFlowAction,
  dialogFlowActionLambdaHandler: dialogFlowAction.lambda(),
  dialogFlowActionLambdaHTTPHandler: dialogFlowAction.lambdaHTTP()
};
