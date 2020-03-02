import * as _ from "lodash";
import { IVoxaEvent } from "../../VoxaEvent";

export enum EntityOverrideMode {
  Unspecified = "ENTITY_OVERRIDE_MODE_UNSPECIFIED",
  Override = "ENTITY_OVERRIDE_MODE_OVERRIDE",
  Supplement = "ENTITY_OVERRIDE_MODE_SUPPLEMENT",
}

export enum UpdateBehavior {
  Replace = "REPLACE",
  Clear = "CLEAR",
}

export abstract class EntityHelper {
  protected sessionEntityObject(
    property: any,
    entityOverrideMode: string,
    name: string,
    event: IVoxaEvent,
  ): any {
    return {
      entities: property.entities.map((item: any) => this.entityValues(item)),
      entityOverrideMode,
      name: `${event.rawEvent.session}/entityTypes/${name}`,
    };
  }

  protected entityValues(prop: any) {
    return {
      synonyms: prop.synonyms,
      value: prop.value,
    };
  }

  protected dynamicEntityObject(property: any, name: string): any {
    const values: any = property.entities.map((prop: any) => {
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
    });

    return {
      name,
      values,
    };
  }

  protected validateEntityBehavior(property: any, platform: string): any {
    let behavior =
      _.get(property, "entityOverrideMode") ||
      _.get(property, "updateBehavior");

    let defaultBehavior: any;
    let behaviorList: any;
    let error: any;

    ({ defaultBehavior, behaviorList, error } = this.getErrorPerPlatform(
      platform,
    ));

    behavior = behavior || defaultBehavior;

    if (!_.includes(behaviorList, behavior)) {
      throw new Error(error);
    }
    return behavior;
  }

  protected validateEntity(property: any): any {
    const entities = _.get(property, "entities");
    if (!entities || _.isEmpty(entities)) {
      throw new Error(
        "The entities property is empty or was not provided, please verify",
      );
    }
  }

  protected validateEntityName(property: any, platform: string): any {
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
        `The name property in ${platform}EntityName can only include alphanumeric and the ${specialCharacter} character`,
      );
    }
    return name;
  }

  protected async getGenericEntity(
    entity: any,
    event: IVoxaEvent,
    viewPath: any,
  ) {
    if (_.isString(viewPath)) {
      entity = await event.renderer.renderPath(viewPath, event);
    }
    if (_.isPlainObject(entity)) {
      entity = [entity];
    }
    if (!_.isArray(entity) || _.isEmpty(entity)) {
      throw new Error(
        "Please verify your entity it could be empty or is not an array",
      );
    }
    return entity;
  }

  protected getErrorPerPlatform(platform: string) {
    let defaultBehavior: any;
    let behaviorList: any;
    let error: any;
    const dialogflowEntityBehaviorList = [
      EntityOverrideMode.Unspecified,
      EntityOverrideMode.Override,
      EntityOverrideMode.Supplement,
    ];

    const alexaEntityBehaviorList = [
      UpdateBehavior.Replace,
      UpdateBehavior.Clear,
    ];

    if (platform === "google") {
      defaultBehavior = EntityOverrideMode.Override;
      behaviorList = dialogflowEntityBehaviorList;
      error = `The entityOverrideMode is incorrect, please consider use one of the followings: ${EntityOverrideMode.Unspecified}, ${EntityOverrideMode.Override} or ${EntityOverrideMode.Supplement}`;
    }

    if (platform === "alexa") {
      defaultBehavior = UpdateBehavior.Replace;
      behaviorList = alexaEntityBehaviorList;
      error = `The updateBehavior is incorrect, please consider use one of the followings: ${UpdateBehavior.Replace} or ${UpdateBehavior.Clear}`;
    }

    return { defaultBehavior, behaviorList, error };
  }

  protected createSessionEntity(
    rawEntity: any,
    platform: string,
    event: IVoxaEvent,
  ) {
    let behavior: any;
    const entity = rawEntity.reduce(
      (filteredEntity: any, property: any): any => {
        let newEntity: any;
        const name = this.validateEntityName(property, platform);
        this.validateEntity(property);

        behavior = this.validateEntityBehavior(property, platform);

        newEntity = this.sessionEntityObject(property, behavior, name, event);

        filteredEntity.push(newEntity);
        return filteredEntity;
      },
      [],
    );
    return entity;
  }

  protected createDynamicEntity(rawEntity: any, platform: string) {
    const entity = rawEntity.reduce(
      (filteredEntity: any, property: any): any => {
        let newEntity: any;
        const name = this.validateEntityName(property, platform);
        this.validateEntity(property);

        this.validateEntityBehavior(property, platform);

        newEntity = this.dynamicEntityObject(property, name);

        filteredEntity.push(newEntity);
        return filteredEntity;
      },
      [],
    );
    return entity;
  }
}
