import * as bluebird from "bluebird";
import * as debug from "debug";
import { Resource } from "i18next";
import * as _ from "lodash";
import { ITransition } from "../StateMachine";
import { IVoxaEvent } from "../VoxaEvent";

export interface IRendererConfig {
  variables?: any;
  views: Resource;
}

export interface IMessage {
  [name: string]: any;

  ask?: string;
  tell?: string;
  say?: string;
  reprompt?: string;

  card?: any;
  directives?: any[];
}

export interface IRenderer {
  new(config: IRendererConfig): Renderer;
}

export class Renderer {
  public config: any;

  constructor(config: IRendererConfig) {
    if (!config.variables) {
      config.variables = {};
    }

    if (!config.views) {
      throw new Error("DefaultRenderer config should include views");
    }

    this.config = config;
  }

  public async renderPath(view: string, voxaEvent: IVoxaEvent, variables?: any) {
    const locale = _.get(voxaEvent, "request.locale");
    const platform = _.get(voxaEvent, "platform");

    let message = voxaEvent.t(view, {
      returnObjects: true,
    });

    if (platform && message[platform]) {
      message = message[platform];
    }

    if (_.isString(message) && message === view) {
      throw new Error(`View ${view} for ${locale} locale is missing`);
    }

    return this.renderMessage(message, voxaEvent);
  }

  public renderMessage(msg: any, event: IVoxaEvent) {
    /**
     * it makes a deep search for strings that could have a variable on it
     * @param  any statement - can be a string, array, object or any other value
     * @param VoxaEvent voxaEvent
     * @return Promise             Promise with the statement rendered
     * @example
     * // return { Launch: 'Hi, morning', card: { type: 'Standard', title: 'title' ...}}
     * deepSearchRenderVariable({ Launch: 'hi, {time}', card: '{exitCard}' }, voxaEvent);
     */
    const self = this;
    async function deepSearchRenderVariable(statement: any, voxaEvent: IVoxaEvent): Promise<any> {
      if (_.isObject(statement) && !_.isArray(statement)) {
        const objPromises = _.chain(statement)
          .toPairs()
          .map(_.spread((key, value) => {
            const isAnOpenResponse = _.includes(["ask", "tell", "say", "reprompt"], key);
            if (isAnOpenResponse && _.isArray(value)) {
              return [key, deepSearchRenderVariable(value, voxaEvent)];
            }

            return [key, deepSearchRenderVariable(value, voxaEvent)];
          }))
          .flattenDeep()
          .value();

        const result = await Promise.all(objPromises);

        return _.chain(result)
          .chunk(2)
          .fromPairs()
          .value();
      }

      if (_.isString(statement)) {
        return await self.renderStatement(statement, voxaEvent);
      }

      if (_.isArray(statement)) {
        return await bluebird.map(statement, (statementItem) => deepSearchRenderVariable(statementItem, voxaEvent));
      }

      return statement;
    }

    return deepSearchRenderVariable(msg, event);
  }

  public async renderStatement(statement: string, voxaEvent: IVoxaEvent) {
    const tokenRegx = /{([\s\S]+?)}/g;
    _.templateSettings.interpolate = tokenRegx;

    const tokenKeys = _
      .uniq(statement.match(tokenRegx) || [])
      .map((str: string) => str.substring(1, str.length - 1));

    const qVariables = _(tokenKeys)
      .map((token) => {
        if (!this.config.variables[token]) {
          throw new Error(`No such variable in views, ${token}`);
        }

        return [token, this.config.variables[token](voxaEvent)];
      })
      .flatten()
      .value();

    const vars = await Promise.all(qVariables);
    const data = _(vars).chunk(2).fromPairs().value();
    const dataKeys = _.keys(data);
    const dataValues = _.values(data);

    if (_.isEmpty(statement.replace(tokenRegx, "").trim()) && dataKeys.length === 1) {
      const singleValue = (_.head(dataValues));
      return _.isObject(singleValue) ? singleValue : _.template(statement)(data);
    }

    return _.template(statement)(data);
  }
}
