/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  GoogleActionsTransactionsV3CompletePurchaseValuePurchaseStatus,
  GoogleActionsTransactionsV3SkuIdSkuType,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import { LambdaLog } from "lambda-log";
import * as _ from "lodash";
import * as rp from "request-promise";

import { ApiBase } from "./ApiBase";
import { ITransactionOptions } from "./ITransactionOptions";

/**
 * DigitalGoods API class reference
 * https://developers.google.com/actions/transactions/digital/dev-guide-digital
 */
export class DigitalGoods extends ApiBase {
  public tag: string = "DigitalGoods";

  constructor(
    event: GoogleCloudDialogflowV2WebhookRequest,
    log: LambdaLog,
    options: ITransactionOptions,
  ) {
    super(event, log, options);

    this.tag = "DigitalGoods";
  }

  /**
   * Gets Entitlements from PlayStore
   */
  public async getInAppEntitlements(skus: string[]) {
    return this.getSkus(skus, "SKU_TYPE_IN_APP");
  }

  /**
   * Gets Subscriptions from PlayStore
   */
  public async getSubscriptions(skus: string[]) {
    return this.getSkus(skus, "SKU_TYPE_SUBSCRIPTION");
  }

  /**
   * Gets Skus from PlayStore
   */
  public async getSkus(skus: string[], type: GoogleActionsTransactionsV3SkuIdSkuType) {
    const conversationId = _.get(this.rawEvent, "originalDetectIntentRequest.payload.conversation.conversationId");
    const androidAppPackageName = _.get(this.transactionOptions, "androidAppPackageName");

    if (!androidAppPackageName) {
      throw new Error("Android App package name missing");
    }

    const credentials = await this.getCredentials();
    const bearer = credentials.access_token as string;

    const options = {
      auth: {
        bearer,
      },
      body: {
        conversationId,
        ids: skus,
        skuType: type,
      },
      json: true, // Automatically parses the JSON string in the response
      method: "POST",
      uri: `https://actions.googleapis.com/v3/packages/${androidAppPackageName}/skus:batchGet`,
    };

    return rp(options);
  }

  /**
   * Gets Google Transactions Status
   */
  public getPurchaseStatus(): GoogleActionsTransactionsV3CompletePurchaseValuePurchaseStatus {
    const googleArguments = _.get(this.rawEvent, "originalDetectIntentRequest.payload.inputs[0].arguments", []);
    let purchaseStatus: GoogleActionsTransactionsV3CompletePurchaseValuePurchaseStatus = PURCHASE_STATUS.UNSPECIFIED;

    _.forEach(googleArguments, (argument) => {
      if (argument.name === "COMPLETE_PURCHASE_VALUE") {
        purchaseStatus = argument.extension.purchaseStatus;

        return false;
      }
    });

    return purchaseStatus;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_ALREADY_OWNED
   */
  public isPurchaseStatusAlreadyOwned(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.ALREADY_OWNED;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_ITEM_CHANGE_REQUESTED
   */
  public isPurchaseStatusChangeRequested(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.ITEM_CHANGE_REQUESTED;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_ERROR
   */
  public isPurchaseStatusError(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.ERROR;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_ITEM_UNAVAILABLE
   */
  public isPurchaseStatusItemUnavailable(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.ITEM_UNAVAILABLE;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_OK
   */
  public isPurchaseStatusOk(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.OK;
  }

  /**
   * Checks if purchase status is PURCHASE_STATUS_USER_CANCELLED
   */
  public isPurchaseStatusUserCancelled(): boolean {
    const purchaseStatus = this.getPurchaseStatus();

    return purchaseStatus === PURCHASE_STATUS.USER_CANCELLED;
  }
}

enum PURCHASE_STATUS {
  ALREADY_OWNED = "PURCHASE_STATUS_ALREADY_OWNED",
  ERROR = "PURCHASE_STATUS_ERROR",
  ITEM_CHANGE_REQUESTED = "PURCHASE_STATUS_ITEM_CHANGE_REQUESTED",
  ITEM_UNAVAILABLE = "PURCHASE_STATUS_ITEM_UNAVAILABLE",
  OK = "PURCHASE_STATUS_OK",
  UNSPECIFIED = "PURCHASE_STATUS_UNSPECIFIED",
  USER_CANCELLED = "PURCHASE_STATUS_USER_CANCELLED",
}
