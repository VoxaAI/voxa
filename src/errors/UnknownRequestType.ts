
export class UnknownRequestType extends Error {
  public requestType: string;

  constructor(requestType: string) {
    const message = `Unkown request type: ${requestType}`;
    super(message);
    this.requestType = requestType;
  }
}
