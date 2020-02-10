import { Response } from "ask-sdk-model";
import * as _ from "lodash";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { AlexaReply } from "../alexa/AlexaReply";
import { DialogflowReply } from "../dialogflow/DialogflowReply";

export class Entity implements IDirective {
  public static key: string = "entities";
  public static platform: string = "core";

  public viewPath?: any | any[];

  constructor(viewPath: any | any[]) {
    this.viewPath = viewPath;
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let entity: any = this.viewPath;
    const response: Response = (reply as AlexaReply).response;

    Entity.platform = _.get(event, "platform.name");

    if (_.isString(this.viewPath)) {
      entity = await event.renderer.renderPath(this.viewPath, event);
    }

    if (_.isPlainObject(entity)) {
      entity = [entity];
    }

    if (!_.isArray(entity) || _.isEmpty(entity)) {
      throw new Error(
        "Please verify your entity it could be empty or is not an array",
      );
    }

    entity = generateEntity(entity, event);

    if (Entity.platform === "google") {
      (reply as DialogflowReply).sessionEntityTypes = entity;
    }

    if (Entity.platform === "alexa") {
      const directive = _.get(response, "directive");
      if (!response.directives) {
        response.directives = [];
      }

      response.directives.push(...entity);
    }
  }
}

export enum EntityOverrideMode {
  Unspecified = "ENTITY_OVERRIDE_MODE_UNSPECIFIED",
  Override = "ENTITY_OVERRIDE_MODE_OVERRIDE",
  Supplement = "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
}

function generateEntity(entity: any[], event: IVoxaEvent) {
  const newSessionEntity = entity.reduce((filteredEntity, property) => {
    let behavior = "updateBehavior";
    let defaultBehavior = "REPLACE";
    const platform = _.get(event, "platform.name");

    if (platform === "google") {
      behavior = "entityOverrideMode";
      defaultBehavior = "ENTITY_OVERRIDE_MODE_OVERRIDE";
    }

    const entityMode = _.get(property, behavior, defaultBehavior);
    const name = _.get(property, "name");
    const entities = _.get(property, "entities");

    validateEntityBehavior(entityMode, platform);
    validateEntityName(name);
    validateEntity(entities);
    let newEntity;

    if (platform === "alexa") {
      newEntity = alexaDynamicEntity(property, entityMode, name);
    }
    if (platform === "google") {
      newEntity = dialogflowSessionEntity(property, entityMode, name, event);
    }
    filteredEntity.push(newEntity);
    return filteredEntity;
  }, []);

  return newSessionEntity;
}

function dialogflowSessionEntity(
  property: any,
  entityOverrideMode: string,
  name: string,
  event: IVoxaEvent,
) {
  return {
    entities: property.entities,
    entityOverrideMode,
    name: `${event.rawEvent.session}/entityTypes/${name}`,
  };
}

function alexaDynamicEntity(
  property: any,
  updateBehavior: string,
  name: string,
) {
  return {
    type: "Dialog.UpdateDynamicEntities",
    types: [
      {
        name,
        values: property.entities,
      },
    ],
    updateBehavior,
  };
}

function validateEntityBehavior(behavior: string, platform: string) {
  const dialogflowEntityBehaviorList = [
    EntityOverrideMode.Unspecified,
    EntityOverrideMode.Override,
    EntityOverrideMode.Supplement,
  ];

  const alexaEntityBehaviorList = ["REPLACE", "CLEAR"];

  let behaviorList = alexaEntityBehaviorList;
  let error =
    "The updateBehavior is incorrect, please consider use one of the followings: REPLACE or CLEAR";

  if (platform === "google") {
    behaviorList = dialogflowEntityBehaviorList;
    error =
      "The entityOverrideMode is incorrect, please consider use one of the followings: ENTITY_OVERRIDE_MODE_UNSPECIFIED, ENTITY_OVERRIDE_MODE_OVERRIDE or ENTITY_OVERRIDE_MODE_SUPPLEMENT";
  }

  if (!_.includes(behaviorList, behavior)) {
    throw new Error(error);
  }
}

function validateEntity(entities: any) {
  if (!entities || _.isEmpty(entities)) {
    throw new Error(
      "The entities property is empty or was not provided, please verify",
    );
  }
}

function validateEntityName(name: string) {
  const regexName = new RegExp(/^[A-Z-_]+$/i);
  if (!name) {
    throw new Error("A name is required for the Entity");
  }

  if (!regexName.test(name)) {
    throw new Error(
      "The name property for the Entity should be only alphabetic characters, and you can include - or _",
    );
  }
}
