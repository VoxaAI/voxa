const { VoxaApp, DialogFlowPlatform, AlexaPlatform } = require("voxa");
const views = require('./views.json')

const app = new VoxaApp({ views });
app.onIntent("LaunchIntent", (request) => {
  return {
    ask: "launch",
    to: "likesVoxa?",
  };
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
exports.alexaHTTPHandler = alexaSkill.lambdaHTTP();

const dialogFlowAction = new DialogFlowPlatform(app);
exports.dialogFlowHandler = dialogFlowAction.lambda();
exports.dialogFlowHTTPHandler = dialogFlowAction.lambdaHTTP();
