// import { er } from "ask-sdk-model";
import * as _ from "lodash";
import { IVoxaEvent } from "../../VoxaEvent";

export enum UpdateBehavior {
  Replace = "REPLACE",
  Clear = "CLEAR",
}

export interface ISessionEntity {
  name: string;
  entities: IEntity[];
  entityOverrideMode: EntityOverrideMode;
}

export enum EntityOverrideMode {
  Unspecified = "ENTITY_OVERRIDE_MODE_UNSPECIFIED",
  Override = "ENTITY_OVERRIDE_MODE_OVERRIDE",
  Supplement = "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
}

export interface IEntity {
  value: string;
  synonyms: string[];
}

export interface IDynamicEntityValues {
  id?: any;
  name: IEntity[];
}

export interface IDynamicEntity {
  name: string;
  values: IDynamicEntityValues[];
}

export abstract class EntityHelper {
  protected dynamicEntityObject(property: any, name: string): IDynamicEntity {
    const values: IDynamicEntityValues[] = property.entities.map(
      (prop: any) => {
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
    );

    return {
      name,
      values,
    };
  }

  protected entityValues(prop: any) {
    return {
      synonyms: prop.synonyms,
      value: prop.value,
    };
  }

  // protected getBehaviorError() {
  //   const alexaEntityBehaviorList = [
  //     UpdateBehavior.Replace,
  //     UpdateBehavior.Clear,
  //   ];

  //   const defaultBehavior = UpdateBehavior.Replace;
  //   const behaviorList = alexaEntityBehaviorList;
  //   const error = `The updateBehavior is incorrect, please consider use one of the followings: ${UpdateBehavior.Replace} or ${UpdateBehavior.Clear}`;

  //   return { defaultBehavior, behaviorList, error };
  // }

  protected getOverrideModeError() {
    const dialogflowEntityBehaviorList = [
      EntityOverrideMode.Unspecified,
      EntityOverrideMode.Override,
      EntityOverrideMode.Supplement,
    ];

    const defaultBehavior = EntityOverrideMode.Override;
    const behaviorList = dialogflowEntityBehaviorList;
    const error = `The entityOverrideMode is incorrect, please consider use one of the followings: ${EntityOverrideMode.Unspecified}, ${EntityOverrideMode.Override} or ${EntityOverrideMode.Supplement}`;

    return { defaultBehavior, behaviorList, error };
  }

  protected validateGoogleEntityBehavior(property: any): any {
    let behavior: EntityOverrideMode = _.get(property, "entityOverrideMode");

    let defaultBehavior: EntityOverrideMode;
    let behaviorList: any;
    let error: string;

    ({ defaultBehavior, behaviorList, error } = this.getOverrideModeError());

    behavior = behavior || defaultBehavior;

    if (!_.includes(behaviorList, behavior)) {
      throw new Error(error);
    }
    return behavior;
  }

  // protected validateAlexaEntityBehavior(property: any): any {
  //   let behavior: er.dynamic.UpdateBehavior = _.get(property, "updateBehavior");

  //   let defaultBehavior: er.dynamic.UpdateBehavior;
  //   let behaviorList: any;
  //   let error: string;

  //   ({ defaultBehavior, behaviorList, error } = this.getBehaviorError());

  //   behavior = behavior || defaultBehavior;

  //   if (!_.includes(behaviorList, behavior)) {
  //     throw new Error(error);
  //   }
  //   return behavior;
  // }

  protected validateEntity(property: any): any {
    const entities = _.get(property, "entities");
    if (!entities || _.isEmpty(entities)) {
      throw new Error(
        "The entities property is empty or was not provided, please verify"
      );
    }
  }

  protected validateEntityName(property: any, platform: string): string {
    let pattern = /^[A-Z_]+$/i;
    let specialCharacter = "underscore(_)";
    let name = _.get(property, "name");
    name = _.get(property, `${platform}EntityName`, name);

    if (platform === "google") {
      specialCharacter = "dash(-)";
      pattern = /^[A-Z-]+$/i;
    }

    if (!name) {
      throw new Error("A name is required for the Entity");
    }

    const regex = new RegExp(pattern);
    if (!regex.test(name)) {
      throw new Error(
        `The name property in ${platform}EntityName can only include alphanumeric and the ${specialCharacter} character`
      );
    }
    return name;
  }

  protected async getGenericEntity(
    entity: any,
    event: IVoxaEvent,
    viewPath: any
  ) {
    if (_.isString(viewPath)) {
      entity = await event.renderer.renderPath(viewPath, event);
    }
    if (_.isPlainObject(entity)) {
      entity = [entity];
    }
    if (!_.isArray(entity) || _.isEmpty(entity)) {
      throw new Error(
        "Please verify your entity it could be empty or is not an array"
      );
    }
    return entity;
  }
}
