/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
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

import { EventsBuilder } from "../ProactiveEvents";

/**
 * Trash Collection Alert Events Builder class reference
 */
export class TrashCollectionAlertEventBuilder extends EventsBuilder {
  public alert: any = {};

  public setAlert(
    collectionDayOfWeek: GARBAGE_COLLECTION_DAY,
    ...garbageTypes: GARBAGE_TYPE[]): TrashCollectionAlertEventBuilder {
    this.alert = {
      collectionDayOfWeek,
      garbageTypes,
    };

    return this;
  }

  public build(): TrashCollectionAlertEventBuilder {
    const payload = {
      alert: this.alert,
    };

    this.setName("AMAZON.TrashCollectionAlert.Activated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum GARBAGE_COLLECTION_DAY {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum GARBAGE_TYPE {
  BOTTLES = "BOTTLES",
  BULKY = "BULKY",
  BURNABLE = "BURNABLE",
  CANS = "CANS",
  CLOTHING = "CLOTHING",
  COMPOSTABLE = "COMPOSTABLE",
  CRUSHABLE = "CRUSHABLE",
  GARDEN_WASTE = "GARDEN_WASTE",
  GLASS = "GLASS",
  HAZARDOUS = "HAZARDOUS",
  HOME_APPLIANCES = "HOME_APPLIANCES",
  KITCHEN_WASTE = "KITCHEN_WASTE",
  LANDFILL = "LANDFILL",
  PET_BOTTLES = "PET_BOTTLES",
  RECYCLABLE_PLASTICS = "RECYCLABLE_PLASTICS",
  WASTE_PAPER = "WASTE_PAPER",
}
