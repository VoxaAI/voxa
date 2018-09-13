require("source-map-support").install();
const { VoxaApp, DialogFlowPlatform, AlexaPlatform } = require("voxa");
const views = require("./views.json");

const app = new VoxaApp({ views });
app.onIntent("LaunchIntent", request => {
  return {
    ask: "launch",
    to: "likesVoxa?"
  };
});

app.onState("likesVoxa?", request => {
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

const dialogFlowAction = new DialogFlowPlatform(app);

module.exports = {
  alexaSkill,
  alexaLambdaHandler: alexaSkill.lambda(),
  alexaLambdaHTTPHandler: alexaSkill.lambdaHTTP(),
  dialogFlowAction: dialogFlowAction,
  dialogFlowActionLambdaHandler: dialogFlowAction.lambda(),
  dialogFlowActionLambdaHTTPHandler: dialogFlowAction.lambdaHTTP()
};
