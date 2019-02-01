import * as _ from "lodash";

import { IBag, IVoxaSession } from "../../../VoxaEvent";

export class FacebookSession implements IVoxaSession {
  public attributes: IBag = {};
  public contexts: IFacebookContext[];
  public outputAttributes: IBag = {};
  public new: boolean;
  public sessionId: string;

  constructor(rawEvent: any) {
    this.sessionId = rawEvent.session;
    this.new = rawEvent.queryResult.name === "WELCOME";
    this.contexts = rawEvent.queryResult.outputContexts as IFacebookContext[];

    const attributesContext = _.find(this.contexts,
      (x) => _.endsWith(x.name, "attributes")) as IFacebookContext;

    if (attributesContext) {
      this.attributes = JSON.parse(_.get(attributesContext, "parameters.attributes", "{}"));
    }
  }
}

export interface IFacebookContext {
  name?: string;
  lifespanCount?: number;
  parameters?: any;
}
