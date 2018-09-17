export class UnknownState extends Error {
  public state: string;

  constructor(state: string) {
    const message = `Unknown state ${state}`;
    super(message);
    this.state = state;
  }
}
