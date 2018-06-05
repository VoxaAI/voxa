const { AlexaPlatform } = require("../../src/platforms/alexa/AlexaPlatform");
const { VoxaApp } = require("../../src/VoxaApp");
const { DialogFlowPlatform } = require('../../src/platforms/dialog-flow/DialogFlowPlatform')
const views = require('./views.json')

const app = new VoxaApp({ views });
app.onIntent("LaunchIntent", {
  ask: "launch",
  to: "likesVoxa?",
});

app.onState("likesVoxa?", (request) => {
  if (!request.intent) {
    throw new Error("Not an intent request");
  }

  if (request.intent.name === "YesIntent") {
    return { tell: "doesLikeVoxa" };
  }

  if (request.intent.name === "NoIntent") {
    return { ask: "doesNotLikeVoxa" };
  }
});

const alexaSkill = new AlexaPlatform(app);
exports.alexaHandler = alexaSkill.lambda();

const dialogFlowAction = new DialogFlowPlatform(app);
exports.dialogFlowHandler = dialogFlowAction.lambda();
