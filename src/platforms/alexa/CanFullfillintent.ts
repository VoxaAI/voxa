import { DialogState, Intent } from "ask-sdk-model";

/**
 * An object that represents a request made to skill to query whether the skill can understand and fulfill the intent request with detected slots, before actually asking the skill to take action. Skill should be aware this is not to actually take action, skill should handle this request without causing side-effect, skill should not modify some state outside its scope or has an observable interaction with its calling functions or the outside world besides returning a value, such as playing sound,turning on/off lights, committing a transaction or a charge.
 * @interface
 */
// tslint:disable-next-line
export interface CanFulfillIntentRequest {
  type: "CanFulfillIntentRequest";
  requestId: string;
  timestamp: string;
  locale: string;
  dialogState?: DialogState;
  intent: Intent;
}

/**
 * Overall if skill can understand and fulfill the intent with detected slots. Respond YES when skill understands all slots, can fulfill all slots, and can fulfill the request in its entirety. Respond NO when skill either cannot understand the intent, cannot understand all the slots, or cannot fulfill all the slots. Respond MAYBE when skill can understand the intent, can partially or fully understand the slots, and can partially or fully fulfill the slots. The only cases where should respond MAYBE is when skill partially understand the request and can potentially complete the request if skill get more data, either through callbacks or through a multi-turn conversation with the user.
 * @enum
 */
type CanFulfillIntentValues = "YES" | "NO" | "MAYBE";

/**
 * This represents skill's capability to understand and fulfill each detected slot.
 * @interface
 */
// tslint:disable-next-line
export interface CanFulfillSlot {
  canUnderstand: CanUnderstandSlotValues;
  canFulfill?: CanFulfillSlotValues;
}

/**
 * This field indicates whether skill can fulfill relevant action for the slot, that has been partially or fully understood. The definition of fulfilling the slot is dependent on skill and skill is required to have logic in place to determine whether a slot value can be fulfilled in the context of skill or not. Return YES if Skill can certainly fulfill the relevant action for this slot value. Return NO if skill cannot fulfill the relevant action for this slot value. For specific recommendations to set the value refer to the developer docs for more details.
 * @enum
 */
type CanFulfillSlotValues = "YES" | "NO";

/**
 * This field indicates whether skill has understood the slot value. In most typical cases, skills will do some form of entity resolution by looking up a catalog or list to determine whether they recognize the slot or not. Return YES if skill have a perfect match or high confidence match (for eg. synonyms) with catalog or list maintained by skill. Return NO if skill cannot understand or recognize the slot value. Return MAYBE if skill have partial confidence or partial match. This will be true when the slot value doesn’t exist as is, in the catalog, but a variation or a fuzzy match may exist. For specific recommendations to set the value refer to the developer docs for more details.
 * @enum
 */
type CanUnderstandSlotValues = "YES" | "NO" | "MAYBE";

/**
 * CanFulfillIntent represents the response to canFulfillIntentRequest includes the details about whether the skill can understand and fulfill the intent request with detected slots.
 * @interface
 */
// tslint:disable-next-line
export interface CanFulfillIntent {
  canFulfill: CanFulfillIntentValues;
  slots?: {
    [key: string]: CanFulfillSlot;
  };
}

// tslint:disable-next-line
export interface CanFulfillResponse {
  canFulfillIntent: CanFulfillIntent;
}
