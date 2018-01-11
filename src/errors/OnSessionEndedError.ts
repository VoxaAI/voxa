export class OnSessionEndedError extends Error {
  public requestType: string;

  constructor(errorOnSession: any) {
    if (errorOnSession instanceof Object && errorOnSession.constructor === Object) {
      errorOnSession = JSON.stringify(errorOnSession, null, 2);
    }
    const message = `Session ended with an error: ${errorOnSession}`;
    super(message);
    this.requestType = "SessionEndedRequest";
  }
}
