import { RequestEnvelope } from "ask-sdk-model";
import * as _ from "lodash";

import { ApiBase } from "./ApiBase";

/**
 * CustomerContact API class reference
 * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
 */
export class CustomerContact extends ApiBase {
  constructor(event: RequestEnvelope) {
    super(event);

    this.tag = "CustomerContact";
    this.errorCodeSafeToIgnore = 403;
  }

  /**
   * Gets user's email address
   */
  public getEmail(): Promise<string> {
    return this.getResult("v2/accounts/~current/settings/Profile.email");
  }

  /**
   * Gets user's given name
   */
  public getGivenName(): Promise<string> {
    return this.getResult(
      "v2/accounts/~current/settings/Profile.givenName",
    ).catch((err: any) => this.checkError(err));
  }

  /**
   * Gets user's name
   */
  public getName(): Promise<string> {
    return this.getResult("v2/accounts/~current/settings/Profile.name").catch(
      (err: any) => this.checkError(err),
    );
  }

  /**
   * Gets user's phone number
   */
  public getPhoneNumber(): Promise<any> {
    return this.getResult("v2/accounts/~current/settings/Profile.mobileNumber");
  }

  /**
   * Gets user's full contact information
   */
  public async getFullUserInformation() {
    const infoRequests = [
      this.getEmail(),
      this.getGivenName(),
      this.getName(),
      this.getPhoneNumber(),
    ];

    const [email, givenName, name, phoneNumber] = await Promise.all(
      infoRequests,
    );
    const info = { email, givenName, name };

    return _.merge(info, phoneNumber);
  }
}
