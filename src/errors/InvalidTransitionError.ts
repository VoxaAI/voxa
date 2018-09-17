export class InvalidTransitionError extends Error {
  public transition: any;

  constructor(transition: any, details: string) {
    const message = `Transition was not valid ${details}. ${JSON.stringify(
      transition,
    )}`;
    super(message);
    this.transition = transition;
  }
}
