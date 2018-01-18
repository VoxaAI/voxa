import * as _ from "lodash";

import { Responses } from "actions-on-google";
import { StandardIntents } from "actions-on-google/assistant-app";
import { Context, DialogflowApp } from "actions-on-google/dialogflow-app";
import { toSSML } from "../../ssml";
import { IVoxaSession } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";

export class DialogFlowReply extends VoxaReply {
  public voxaEvent: DialogFlowEvent;

  public sessionToContext(): any[] {
    if (!(this.session && !_.isEmpty(this.session.attributes))) {
      return [];
    }

    return _(this.session.attributes)
      .map((parameters: any, name: string): any => {
        if (!parameters || _.isEmpty(parameters)) {
          return;
        }

        const currentContext: any = { name, lifespan: 10000, parameters: {} };
        if (_.isPlainObject(parameters)) {
          currentContext.parameters = parameters;
        } else {
          currentContext.parameters[name] = parameters;
        }

        return currentContext;
      })
      .filter()
      .value();
  }

  public google() {
    const speech = toSSML(this.response.statements.join("\n"));
    const noInputPrompts = [];
    let possibleIntents;

    const richResponse = new Responses.RichResponse();
    if (this.response.reprompt) {
      noInputPrompts.push({
        ssml: this.response.reprompt,
      });
    }

    if (speech) {
      richResponse.addSimpleResponse(speech);
    }

    _.map(this.response.directives, (directive: any) => {
      if (directive.suggestions) {
        richResponse.addSuggestions(directive.suggestions);
      } else if (directive.basicCard) {
        richResponse.addBasicCard(directive.basicCard);
      } else if (directive.possibleIntents) {
        possibleIntents = directive.possibleIntents;
      }

    });

    return {
      expectUserResponse: !this.response.terminate,
      isSsml: true,
      noInputPrompts,
      possibleIntents,
      richResponse,
    };
  }

  public toJSON() {
    const speech = toSSML(this.response.statements.join("\n"));
    const contextOut = this.sessionToContext();

    const source = _.get(this, "voxaEvent.originalRequest.source");

    const integrations: any = {
      google: this.google.bind(this),
    };

    const response: any = {
      contextOut,
      data: {},
      source: "Voxa",
      speech,
    };

    if (integrations[source]) {
      response.data[source] = integrations[source]();
    }

    return response;
  }
}
