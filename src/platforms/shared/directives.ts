import * as _ from "lodash";
import { IVoxaEvent } from "../../VoxaEvent";

export enum EntityOverrideMode {
  Unspecified = "ENTITY_OVERRIDE_MODE_UNSPECIFIED",
  Override = "ENTITY_OVERRIDE_MODE_OVERRIDE",
  Supplement = "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
}

export function generateEntity(entity: any[], event: IVoxaEvent) {
  const newSessionEntity = entity.reduce((filteredEntity, property) => {
    let behavior = "updateBehavior";
    let defaultBehavior = "REPLACE";

    const platformRawEvent = _.get(
      event,
      "rawEvent.originalDetectIntentRequest.source",
    );
    const platform = _.get(event, "platform.name", platformRawEvent);

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
  function entityValues(prop: any) {
    const entity: any = {};
    if (_.get(prop, "id")) {
      entity.id = prop.id;
    }
    if (_.get(prop, "synonyms") && _.get(prop, "value")) {
      entity.name = {
        synonyms: prop.synonyms,
        value: prop.value,
      };
    }
    return entity;
  }

  const values: any = property.entities.map((entity: any) =>
    entityValues(entity),
  );

  return {
    type: "Dialog.UpdateDynamicEntities",
    types: [
      {
        name,
        values,
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
