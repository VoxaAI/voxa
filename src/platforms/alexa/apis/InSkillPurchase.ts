import { RequestEnvelope } from "ask-sdk-model";
import * as _ from "lodash";
import * as rp from "request-promise";

const ConnectionsSendRequest = require('../directives').ConnectionsSendRequest;

export class InSkillPurchase {
  public static buy(productId: string, token: string) {
    const payload: any = {
      InSkillProduct: {
        productId,
      },
    };

    return new ConnectionsSendRequest("Buy", payload, token);
  }

  public static cancel(productId: string, token: string) {
    const payload: any = {
      InSkillProduct: {
        productId,
      },
    };

    return new ConnectionsSendRequest("Cancel", payload, token);
  }

  public static upsell(productId: string, upsellMessage: string, token: string) {
    const payload: any = {
      InSkillProduct: {
        productId,
      },
      upsellMessage,
    };

    return new ConnectionsSendRequest("Upsell", payload, token);
  }

  public voxaEvent: any; // the event as sent by the service

  constructor(event: RequestEnvelope) {
    this.voxaEvent = _.cloneDeep(event);
  }

  public isAllowed() {
    const ALLOWED_ISP_ENDPOINTS = {
      "en-US": "https://api.amazonalexa.com",
    };

    const locale: string = this.voxaEvent.request.locale;
    const endpoint: string = _.get(this.voxaEvent, "context.System.apiEndpoint");

    return _.get(ALLOWED_ISP_ENDPOINTS, locale) === endpoint;
  }

  public async buyByReferenceName(referenceName: string, token: string) {
    const product: any = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.buy(_.get(product, "productId"), token);
  }

  public async cancelByReferenceName(referenceName: string, token: string) {
    const product: any = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.cancel(_.get(product, "productId"), token);
  }

  public async upsellByReferenceName(referenceName: string, upsellMessage: string, token: string) {
    const product: any = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.upsell(_.get(product, "productId"), upsellMessage, token);
  }

  public async getProductByReferenceName(referenceName: string) {
    const result: any = await this.getProductList();

    return _.find(result.inSkillProducts, { referenceName });
  }

  public getProductList() {
    const { apiEndpoint, apiAccessToken } = this.voxaEvent.context.System;

    const options: any = {
      headers: {
        "Accept-Language": this.voxaEvent.request.locale,
        "Authorization": `Bearer ${apiAccessToken}`,
        "Content-Type": "application/json",
      },
      json: true,
      method: "GET",
      uri: `${apiEndpoint}/v1/users/~current/skills/~current/inSkillProducts`,
    };

    return rp(options);
  }
}
