import { Response } from "ask-sdk-model";
import * as _ from "lodash";
import { AlexaReply, DialogflowReply, ITransition, IVoxaReply } from "../..";
import { IDirective } from "../../directives";
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
  public getEntity(rawEntity: any, event: IVoxaEvent): any {
    const platform =
      _.get(event, "platform.name") ||
      _.get(event, "rawEvent.originalDetectIntentRequest.source");

    let entity: any;
    let behavior: any;

    ({ entity, behavior } = this.generateEntityFormat(
      rawEntity,
      platform,
      event,
    ));

    if (platform === "alexa") {
      behavior = this.validateEntityBehavior(
        _.chain(rawEntity)
          .map((e) => e.updateBehavior)
          .find()
          .value(),
        platform,
      );
      return (entity = {
        type: "Dialog.UpdateDynamicEntities",
        types: entity,
        updateBehavior: behavior,
      });
    }

    return entity;
  }

  protected dialogflowSessionEntity(
    property: any,
    entityOverrideMode: string,
    name: string,
    event: IVoxaEvent,
  ): any {
    return {
      entities: property.entities.map((item: any) =>
        this.entityValues(item, "google"),
      ),
      entityOverrideMode,
      name: `${event.rawEvent.session}/entityTypes/${name}`,
    };
  }

  protected entityValues(prop: any, platform?: string) {
    const entity: any = {};
    if (platform === "google") {
      return {
        synonyms: prop.synonyms,
        value: prop.value,
      };
    }

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

  protected alexaDynamicEntity(property: any, name: string): any {
    const values: any = property.entities.map((entity: any) =>
      this.entityValues(entity),
    );

    return {
      name,
      values,
    };
  }

  protected validateEntityBehavior(property: any, platform: string): any {
    let behavior =
      _.get(property, "entityOverrideMode") ||
      _.get(property, "updateBehavior");
    const dialogflowEntityBehaviorList = [
      EntityOverrideMode.Unspecified,
      EntityOverrideMode.Override,
      EntityOverrideMode.Supplement,
    ];

    const alexaEntityBehaviorList = [
      UpdateBehavior.Replace,
      UpdateBehavior.Clear,
    ];

    let defaultBehavior: any;
    let behaviorList: any;
    let error: any;

    ({ defaultBehavior, behaviorList, error } = this.getErrorPerPlatform(
      alexaEntityBehaviorList,
      dialogflowEntityBehaviorList,
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
    let specialCharacter = "underscore character _";
    let name = _.get(property, "name");
    name = _.get(property, `${platform}EntityName`, name);

    if (platform === "google") {
      specialCharacter = "dash character -";
      pattern = /^[A-Z-]+$/i;
    }

    if (!name) {
      throw new Error("A name is required for the Entity");
    }

    const regex = new RegExp(pattern);
    if (!regex.test(name)) {
      throw new Error(
        `The name property (${platform}EntityName) should be only alphabetic characters, and can include ${specialCharacter}`,
      );
    }
    return name;
  }

  protected addReplyPerPlatform(platform: any, reply: IVoxaReply, entity: any) {
    if (platform === "google") {
      (reply as DialogflowReply).sessionEntityTypes = entity;
    }

    const response: Response = (reply as AlexaReply).response;
    if (!response.directives) {
      response.directives = [];
    }
    if (_.isArray(response.directives)) {
      response.directives = _.concat(response.directives, entity);
    } else {
      response.directives!.push(entity);
    }
  }

  protected async rawEntity(entity: any, event: IVoxaEvent, viewPath: any) {
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

  private getErrorPerPlatform(
    alexaEntityBehaviorList: UpdateBehavior[],
    dialogflowEntityBehaviorList: EntityOverrideMode[],
    platform: string,
  ) {
    let defaultBehavior: any;
    let behaviorList: any;
    let error: any;

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

  private generateEntityFormat(
    rawEntity: any,
    platform: any,
    event: IVoxaEvent,
  ) {
    let behavior: any;
    const entity = rawEntity.reduce(
      (filteredEntity: any, property: any): any => {
        let newEntity: any;
        const name = this.validateEntityName(property, platform);
        this.validateEntity(property);

        behavior = this.validateEntityBehavior(property, platform);
        if (platform === "google") {
          newEntity = this.dialogflowSessionEntity(
            property,
            behavior,
            name,
            event,
          );
        }
        if (platform === "alexa") {
          newEntity = this.alexaDynamicEntity(property, name);
        }
        filteredEntity.push(newEntity);
        return filteredEntity;
      },
      [],
    );
    return { entity, behavior };
  }
}

export class Entity extends EntityHelper implements IDirective {
  public static key: string = "entities";
  public static platform: string = "core";

  public viewPath?: any | any[];

  constructor(viewPath: any | any[]) {
    super();
    this.viewPath = viewPath;
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition?: ITransition,
  ): Promise<void> {
    let entity: any = this.viewPath;

    const platform = _.get(event, "platform.name");

    entity = await this.rawEntity(entity, event, this.viewPath);

    entity = this.getEntity(entity, event);

    this.addReplyPerPlatform(platform, reply, entity);
  }
}
