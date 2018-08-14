import { services } from "ask-sdk-model";
import * as _ from "lodash";

/*
 * The Game Engine interface enables your skill to receive input from Echo Buttons
 */
export class GameEngine {
  public static getEventsBuilder(name: string): EventsBuilder {
    return new EventsBuilder(name);
  }

  public static getDeviationRecognizerBuilder(name: string): DeviationRecognizerBuilder {
    return new DeviationRecognizerBuilder(name);
  }

  public static getPatternRecognizerBuilder(name: string): PatternRecognizerBuilder {
    return new PatternRecognizerBuilder(name);
  }

  public static getProgressRecognizerBuilder(name: string): ProgressRecognizerBuilder {
    return new ProgressRecognizerBuilder(name);
  }

  /*
   * Stops Echo Button events from being sent to your skill.
   * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#stop
   */
  public static stopInputHandler(originatingRequestId: string): any {
    return {
      originatingRequestId,
      type: "GameEngine.StopInputHandler",
    };
  }

  public events: any;
  public recognizers: any;

  public setEvents(...eventArray: any[]): GameEngine {
    this.events = this.events || {};

    _.forEach(eventArray, (event) => {
      if (event instanceof EventsBuilder) {
        this.events = _.merge(this.events, event.build());
      } else {
        this.events = _.merge(this.events, event);
      }
    });

    return this;
  }

  public setRecognizers(...recognizerArray: any[]): GameEngine {
    this.recognizers = this.recognizers || {};

    _.forEach(recognizerArray, (recognizer) => {
      if (recognizer instanceof RecognizerBuilder) {
        this.recognizers = _.merge(this.recognizers, recognizer.build());
      } else {
        this.recognizers = _.merge(this.recognizers, recognizer);
      }
    });

    return this;
  }

  /*
   * Configures and starts the Input Handler to send Echo Button events to your skill.
   * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#start
   */
  public startInputHandler(timeout: number, proxies: any): any {
    return {
      events: this.events,
      proxies,
      recognizers: this.recognizers,
      timeout,
      type: "GameEngine.StartInputHandler",
    };
  }
}

/*
 * The recognizers object contains one or more objects that represent different
 * types of recognizers: the patternRecognizer, deviationRecognizer, or progressRecognizer
 */
export class RecognizerBuilder {
  public recognizers: any;
  public recognizerName: string;

  constructor(recognizerName: string, type: string) {
    this.recognizers = {};
    this.recognizerName = recognizerName;
    this.recognizers[recognizerName] = { type };
  }

  public setProperty(property: any) {
    this.recognizers[this.recognizerName] = _.merge(
      this.recognizers[this.recognizerName],
      property);
  }

  public build(): any {
    return this.recognizers;
  }
}

export class DeviationRecognizerBuilder extends RecognizerBuilder {

  constructor(name: string) {
    super(name, "deviation");
  }

  public recognizer(recognizer: string): DeviationRecognizerBuilder {
    this.setProperty({ recognizer });
    return this;
  }
}

export class PatternRecognizerBuilder extends RecognizerBuilder {

  constructor(name: string) {
    super(name, "match");
  }

  /*
   * For more information about the event report values, follow this link:
   * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#patternrecognizer
   */
  public anchor(anchor: string): PatternRecognizerBuilder {
    this.setProperty({ anchor });
    return this;
  }

  public fuzzy(fuzzy: boolean): PatternRecognizerBuilder {
    this.setProperty({ fuzzy });
    return this;
  }

  public gadgetIds(gadgetIds: any): PatternRecognizerBuilder {
    this.setProperty({ gadgetIds });
    return this;
  }

  public actions(actions: string): PatternRecognizerBuilder {
    this.setProperty({ actions });
    return this;
  }

  public pattern(pattern: services.gameEngine.Pattern[]): PatternRecognizerBuilder {
    this.setProperty({ pattern });
    return this;
  }
}

export class ProgressRecognizerBuilder extends RecognizerBuilder {

  constructor(name: string) {
    super(name, "progress");
  }

  public recognizer(recognizer: string): ProgressRecognizerBuilder {
    this.setProperty({ recognizer });
    return this;
  }

  public completion(completion: number): ProgressRecognizerBuilder {
    this.setProperty({ completion });
    return this;
  }
}

/*
 * The events object is where you define the conditions that must be met for
 * your skill to be notified of Echo Button input.
 */
export class EventsBuilder {
  public events: any;
  public eventName: string;

  constructor(eventName: string) {
    this.events = {};
    this.eventName = eventName;
  }

  public setProperty(property: any): EventsBuilder {
    this.events[this.eventName] = _.merge(this.events[this.eventName], property);
    return this;
  }

  public meets(meets: any): EventsBuilder {
    this.setProperty({ meets });
    return this;
  }

  public fails(fails: any): EventsBuilder {
    this.setProperty({ fails });
    return this;
  }

  /*
   * For more information about the event report values, follow this link:
   * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#events
   */
  public reports(reports: string): EventsBuilder {
    this.setProperty({ reports });
    return this;
  }

  public shouldEndInputHandler(shouldEndInputHandler: boolean): EventsBuilder {
    this.setProperty({ shouldEndInputHandler });
    return this;
  }

  public maximumInvocations(maximumInvocations: number): EventsBuilder {
    this.setProperty({ maximumInvocations });
    return this;
  }

  public triggerTimeMilliseconds(triggerTimeMilliseconds: number): EventsBuilder {
    this.setProperty({ triggerTimeMilliseconds });
    return this;
  }

  public build(): any {
    return this.events;
  }
}

/*
 * For more information about the event report values, follow this link:
 * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#events
 */
export const EVENT_REPORT_ENUM = {
  HISTORY: "history",
  MATCHES: "matches",
  NOTHING: "nothing",
};

/*
 * For more information about the event report values, follow this link:
 * https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#patternrecognizer
 */
export const ANCHOR_ENUM = {
  ANYWHERE: "anywhere",
  END: "end",
  START: "start",
};
