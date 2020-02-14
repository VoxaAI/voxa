import * as _ from "lodash";
import { IVoxaEvent } from "../../VoxaEvent";

export enum EntityOverrideMode {
  Unspecified = "ENTITY_OVERRIDE_MODE_UNSPECIFIED",
  Override = "ENTITY_OVERRIDE_MODE_OVERRIDE",
  Supplement = "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
}

export function generateEntity(entity: any[], event: IVoxaEvent) {
  const platformRawEvent = _.get(
    event,
    "rawEvent.originalDetectIntentRequest.source",
  );
  const platform = _.get(event, "platform.name", platformRawEvent);

  let newSessionEntity;

  newSessionEntity = entity.reduce((filteredEntity, property) => {
    let newEntity;
    let entityMode = _.get(property, "updateBehavior", "REPLACE");

    const name = _.get(property, "name");
    const entities = _.get(property, "entities");

    validateEntityName(name);
    validateEntity(entities);

    if (platform === "google") {
      entityMode = _.get(
        property,
        "entityOverrideMode",
        "ENTITY_OVERRIDE_MODE_OVERRIDE",
      );
      validateEntityBehavior(entityMode, platform);
      newEntity = dialogflowSessionEntity(property, entityMode, name, event);
    }

    if (platform === "alexa") {
      newEntity = alexaDynamicEntity(property, name);
    }

    filteredEntity.push(newEntity);
    return filteredEntity;
  }, []);

  if (platform === "alexa") {
    const behavior =
      _.chain(entity)
        .map((e) => e.updateBehavior)
        .find()
        .value() || "REPLACE";

    validateEntityBehavior(behavior, platform);
    return (newSessionEntity = {
      type: "Dialog.UpdateDynamicEntities",
      types: newSessionEntity,
      updateBehavior: behavior,
    });
  }

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

function alexaDynamicEntity(property: any, name: string) {
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
    name,
    values,
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
