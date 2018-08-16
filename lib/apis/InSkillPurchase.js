'use strict';

const _ = require('lodash');
const rp = require('request-promise');

class InSkillPurchase {
  constructor(alexaEvent) {
    this.alexaEvent = alexaEvent;
  }

  isAllowed() {
    const ALLOWED_ISP_ENDPOINTS = {
      'en-US': 'https://api.amazonalexa.com',
    };

    const locale = this.alexaEvent.request.locale;
    const endpoint = _.get(this.alexaEvent, 'context.System.apiEndpoint');

    return ALLOWED_ISP_ENDPOINTS[locale] === endpoint;
  }

  static buy(productId, token) {
    return {
      type: 'Connections.SendRequest',
      name: 'Buy',
      payload: {
        InSkillProduct: {
          productId,
        },
      },
      token: token || 'token',
    };
  }

  static cancel(productId, token) {
    return {
      type: 'Connections.SendRequest',
      name: 'Cancel',
      payload: {
        InSkillProduct: {
          productId,
        },
      },
      token: token || 'token',
    };
  }

  static upsell(productId, upsellMessage, token) {
    return {
      type: 'Connections.SendRequest',
      name: 'Upsell',
      payload: {
        InSkillProduct: {
          productId,
        },
        upsellMessage,
      },
      token: token || 'token',
    };
  }

  async buyByReferenceName(referenceName, token) {
    const product = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.buy(product.productId, token);
  }

  async cancelByReferenceName(referenceName, token) {
    const product = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.cancel(product.productId, token);
  }

  async upsellByReferenceName(referenceName, upsellMessage, token) {
    const product = await this.getProductByReferenceName(referenceName);

    return InSkillPurchase.upsell(product.productId, upsellMessage, token);
  }

  async getProductByReferenceName(referenceName) {
    const result = await this.getProductList();

    return _.find(result.inSkillProducts, { referenceName });
  }

  getProductList() {
    const { apiEndpoint, apiAccessToken } = this.alexaEvent.context.System;

    const options = {
      method: 'GET',
      json: true,
      uri: `${apiEndpoint}/v1/users/~current/skills/~current/inSkillProducts`,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.alexaEvent.request.locale,
        Authorization: `Bearer ${apiAccessToken}`,
      },
    };

    return rp(options);
  }
}

module.exports = InSkillPurchase;
