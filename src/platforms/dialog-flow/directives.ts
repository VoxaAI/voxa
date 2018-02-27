import { AssistantApp, Responses } from "actions-on-google";
import * as _ from "lodash";

import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { InputValueDataTypes, StandardIntents } from "./interfaces";

export class List implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowList";

  public viewPath?: string;
  public list?: Responses.List;

  constructor(viewPath: string|Responses.List) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let listSelect;
    if (this.viewPath) {
      listSelect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      listSelect = this.viewPath;
    }

    (reply as DialogFlowReply).data.google.possibleIntents = {
      inputValueData: {
        "@type": InputValueDataTypes.OPTION,
        listSelect,
      },
      intent: StandardIntents.OPTION,
    };
  }
}

export class Carousel implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCarousel";

  public viewPath?: string;
  public list?: Responses.Carousel;

  constructor(viewPath: string|Responses.Carousel) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.list = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let carouselselect;
    if (this.viewPath) {
      carouselselect = await event.renderer.renderPath(this.viewPath, event);
    } else {
      carouselselect = this.viewPath;
    }

    (reply as DialogFlowReply).data.google.possibleIntents = {
      inputValueData: {
        "@type": InputValueDataTypes.OPTION,
        carouselselect,
      },
      intent: StandardIntents.OPTION,
    };
  }
}

export class Suggestions implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowSuggestions";

  public viewPath?: string;
  public suggestions?: string[];

  constructor(suggestions: string|string[]) {

    if (_.isString(suggestions)) {
      this.viewPath = suggestions;
    } else {
      this.suggestions = suggestions;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let suggestions;
    if (this.viewPath) {
      suggestions = await event.renderer.renderPath(this.viewPath, event);
    } else {
      suggestions = this.suggestions;
    }

    (reply as DialogFlowReply).data.google.richResponse.addSuggestions(suggestions);
  }
}

export class BasicCard implements IDirective {
  public static  platform: string = "dialogFlow";
  public static key: string = "dialogFlowCard";

  public viewPath?: string;
  public basicCard?: Responses.BasicCard;

  constructor(viewPath: string|Responses.BasicCard) {

    if (_.isString(viewPath)) {
      this.viewPath = viewPath;
    } else {
      this.basicCard = viewPath;
    }
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let basicCard;
    if (this.viewPath) {
      basicCard = await event.renderer.renderPath(this.viewPath, event);
    } else {
      basicCard = this.basicCard;
    }

    (reply as DialogFlowReply).data.google.richResponse.addBasicCard(basicCard);
  }
}
