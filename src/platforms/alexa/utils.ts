import { IntentRequest, interfaces, LaunchRequest, SessionEndedRequest } from "ask-sdk-model";

type LocalizedAlexaRequest = interfaces.audioplayer.PlaybackFinishedRequest | interfaces.display.ElementSelectedRequest | SessionEndedRequest | IntentRequest | interfaces.audioplayer.PlaybackFailedRequest | LaunchRequest | interfaces.audioplayer.PlaybackStoppedRequest | interfaces.playbackcontroller.PreviousCommandIssuedRequest | interfaces.audioplayer.PlaybackStartedRequest | interfaces.audioplayer.PlaybackNearlyFinishedRequest | interfaces.connections.ConnectionsResponse | interfaces.connections.ConnectionsRequest | interfaces.system.ExceptionEncounteredRequest | interfaces.gameEngine.InputHandlerEventRequest | interfaces.playbackcontroller.NextCommandIssuedRequest | interfaces.playbackcontroller.PauseCommandIssuedRequest | interfaces.playbackcontroller.PlayCommandIssuedRequest;

export function isLocalizedRequest(request: any): request is LocalizedAlexaRequest {
  return (
    request.type.includes("AudioPlayer.") ||
    request.type.includes("PlaybackController.") ||
    request.type.includes("Connections.") ||
    request.type.includes("GameEngine.") ||
    request.type.includes("System.") ||
    request.type === "Display.ElementSelected" ||
    request.type === "SessionEndedRequest" ||
    request.type === "IntentRequest"
  );
}
