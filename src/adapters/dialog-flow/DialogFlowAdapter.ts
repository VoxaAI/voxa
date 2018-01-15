import * as _ from "lodash";

import { Responses } from "actions-on-google";
import { StandardIntents } from "actions-on-google/assistant-app";
import { Context, DialogflowApp } from "actions-on-google/dialogflow-app";
import { directiveHandler } from "../../directives";
import { toSSML } from "../../ssml";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaSession } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { VoxaAdapter } from "../VoxaAdapter";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { BasicCard, Carousel, List, Suggestions } from "./directives";

export class DialogFlowAdapter extends VoxaAdapter<DialogFlowReply> {
  public static sessionToContext(session: IVoxaSession): any[] {
    if (!(session && !_.isEmpty(session.attributes))) {
      return [];
    }

    return _(session.attributes)
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

  public static google(reply: DialogFlowReply) {
    const speech = toSSML(reply.response.statements.join("\n"));
    const noInputPrompts = [];
    let possibleIntents;

    const richResponse = new Responses.RichResponse();
    if (reply.response.reprompt) {
      noInputPrompts.push({
        ssml: reply.response.reprompt,
      });
    }

    if (speech) {
      richResponse.addSimpleResponse(speech);
    }

    _.map(reply.response.directives, (directive: any) => {
      if (directive.suggestions) {
        richResponse.addSuggestions(directive.suggestions);
      } else if (directive.basicCard) {
        richResponse.addBasicCard(directive.basicCard);
      } else if (directive.possibleIntents) {
        possibleIntents = directive.possibleIntents;
      }

    });

    return {
      expectUserResponse: !reply.response.terminate,
      isSsml: true,
      noInputPrompts,
      possibleIntents,
      richResponse,
    };
  }

  public static toDialogFlowResponse(voxaReply: VoxaReply) {
    const speech = toSSML(voxaReply.response.statements.join("\n"));
    const contextOut = DialogFlowAdapter.sessionToContext(voxaReply.session);

    const source = _.get(voxaReply, "voxaEvent.originalRequest.source");

    const integrations: any = {
      google: DialogFlowAdapter.google,
    };

    const response: any = {
      contextOut,
      data: {},
      source: "Voxa",
      speech,
    };

    if (integrations[source]) {
      response.data[source] = integrations[source](voxaReply);
    }

    return response;
  }

  constructor(voxaApp: VoxaApp) {
    super(voxaApp);
    _.map([List, Carousel, Suggestions, BasicCard],
      (handler: (value: any) => directiveHandler) => voxaApp.registerDirectiveHandler(handler, handler.name));
  }

  public async execute(rawEvent: any, context: any): Promise<any> {
    const event = new DialogFlowEvent(rawEvent, context);
    const voxaReply = await this.app.execute(event, DialogFlowReply);
    return DialogFlowAdapter.toDialogFlowResponse(voxaReply);
  }

}
