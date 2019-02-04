import { expect } from "chai";
import * as _ from "lodash";
import * as simple from "simple-mock";

import {
  FacebookEvent,
  FacebookPlatform,
  GoogleAssistantEvent,
  GoogleAssistantPlatform,
  VoxaApp,
} from "../../src/";
import { variables } from "../variables";
import { views } from "../views";

/* tslint:disable-next-line:no-var-requires */
const launchIntent = require("../requests/dialogflow/launchIntent.json");

/* tslint:disable-next-line:no-var-requires */
const facebookLaunchIntent = require("../requests/dialogflow/facebookLaunchIntent.json");

/* tslint:disable-next-line:no-var-requires */
const optionIntent = require("../requests/dialogflow/actions.intent.OPTION.json");

/* tslint:disable-next-line:no-var-requires */
const mediaStatusIntent = require("../requests/dialogflow/actions.intent.MEDIA_STATUS.json");

/* tslint:disable-next-line:no-var-requires */
const signinIntent = require("../requests/dialogflow/actions.intent.SIGN_IN.json");

/* tslint:disable-next-line:no-var-requires */
const helpIntent = require("../requests/dialogflow/helpIntent.json");

/* tslint:disable-next-line:no-var-requires */
const permissionIntent = require("../requests/dialogflow/actions.intent.PERMISSION.json");

/* tslint:disable-next-line:no-var-requires */
const datetimeIntent = require("../requests/dialogflow/actions.intent.DATETIME.json");

/* tslint:disable-next-line:no-var-requires */
const placeIntent = require("../requests/dialogflow/actions.intent.PLACE.json");

/* tslint:disable-next-line:no-var-requires */
const confirmationIntent = require("../requests/dialogflow/actions.intent.CONFIRMATION.json");

/* tslint:disable-next-line:no-var-requires */
const slotsIntent = require("../requests/dialogflow/slots.json");

/* tslint:disable-next-line:no-var-requires */
const newSurfaceIntent = require("../requests/dialogflow/actions.intent.NEW_SURFACE.json");

describe("FacebookEvent", () => {
  describe("Facebook Messenger", () => {
    it("should get the right userId for Facebook Messenger", async () => {
      const event = new FacebookEvent(facebookLaunchIntent, {});
      expect(event.user.id).to.equal("1234567890");
    });
    it("should get the right source for Facebook Messenger", async () => {
      const event = new FacebookEvent(facebookLaunchIntent, {});
      expect(event.source).to.equal("facebook");
    });
  });
});

describe("GoogleAssistantEvent", () => {
  describe("Google Actions", () => {
    it("should format option values", () => {
      const event = new GoogleAssistantEvent(optionIntent, {});
      expect(event.intent.name).to.equal("actions.intent.OPTION");
      expect(event.intent.params).to.deep.equal({
        OPTION: "today",
        TOUCH: "Today's meditation",
      });
    });

    it("should format dialogflow parms", () => {
      const event = new GoogleAssistantEvent(slotsIntent, {});
      expect(event.intent.name).to.equal("SleepSingleIntent");
      expect(event.intent.params).to.deep.equal({
        VOICE: "10 minutes sleep exercise",
        length: {
          amount: 10,
          unit: "min",
        },
        requestPhrase: "",
        text: "10 minutes sleep exercise",
      });
    });

    it("should find users on the session", () => {
      const event = new GoogleAssistantEvent(launchIntent, {});
      /* tslint:disable-next-line:max-line-length */
      expect(event.user.id).to.equal(
        "ABwppHG14A5zlHSo4Q6CMw3IHD6a3UtYXEtEtcrDrQwBOWKO95VRm-rL-DdhbzDeHXUXiwpDcrDAzY19C8Y",
      );
    });

    it("should return supported capabilities", () => {
      const event = new GoogleAssistantEvent(launchIntent, {});
      expect(event.supportedInterfaces).to.deep.equal([
        "actions.capability.AUDIO_OUTPUT",
        "actions.capability.SCREEN_OUTPUT",
        "actions.capability.MEDIA_RESPONSE_AUDIO",
        "actions.capability.WEB_BROWSER",
      ]);
    });

    it("should return inputs", () => {
      const event = new GoogleAssistantEvent(launchIntent, {});
      expect(event.intent.name).to.equal("LaunchIntent");
      expect(event.intent.params).to.deep.equal({
        KEYBOARD: "Talk to my test app",
        requestPhrase: "",
      });
    });

    it("should return the MEDIA_STATUS information", () => {
      const event = new GoogleAssistantEvent(mediaStatusIntent, {});
      expect(event.intent.name).to.equal("MEDIA_STATUS");
      expect(event.intent.params).to.deep.equal({
        MEDIA_STATUS: {
          "@type": "type.googleapis.com/google.actions.v2.MediaStatus",
          "status": "FINISHED",
        },
      });
    });

    it("should return the SIGN_IN information", () => {
      const event = new GoogleAssistantEvent(signinIntent, {});
      expect(event.intent.params).to.deep.equal({
        SIGN_IN: {
          "@type": "type.googleapis.com/google.actions.v2.SignInValue",
          "status": "OK",
        },
      });
    });

    it("should return the correct intent", () => {
      const event = new GoogleAssistantEvent(helpIntent, {});
      expect(event.intent.name).to.equal("HelpIntent");
    });

    it("should extract the session attributes from the context", () => {
      const event = new GoogleAssistantEvent(helpIntent, {});
      expect(event.session.attributes).to.deep.equal({
        key: "value",
      });
    });

    it("should extract the correct parameters from a permissionIntent", () => {
      const event = new GoogleAssistantEvent(permissionIntent, {});
      expect(event.intent.params).to.deep.equal({
        KEYBOARD: "yes",
        PERMISSION: true,
      });

      expect(event.dialogflow.conv.user.permissions).to.deep.equal(["NAME"]);
    });

    it("should extract the correct parameters from a datetimeIntent", () => {
      const event = new GoogleAssistantEvent(datetimeIntent, {});
      expect(event.intent.params).to.deep.equal({
        DATETIME: {
          date: {
            day: 8,
            month: 6,
            year: 2018,
          },
          time: {
            hours: 12,
          },
        },
        KEYBOARD: "noon",
      });
    });

    it("should extract the correct parameters from a confirmationIntent", () => {
      const event = new GoogleAssistantEvent(placeIntent, {});
      expect(event.intent.params).to.deep.equal({
        KEYBOARD: "Query handled by Actions on Google",
        PLACE: {
          coordinates: {
            latitude: 37.1390728,
            longitude: -121.6572152,
          },
          formattedAddress: "Digital Drive, Morgan Hill, CA 95037, USA",
          name: "Digital Drive",
          placeId: "ChIJF_RbBuogjoAR0BmGuyTKHCY",
        },
      });
    });

    it("should extract the NEW_SURFACE confirmationIntent", () => {
      const event = new GoogleAssistantEvent(newSurfaceIntent, {});
      expect(event.intent.params).to.deep.equal({
        NEW_SURFACE: {
          "@type": "type.googleapis.com/google.actions.v2.NewSurfaceValue",
          "status": "OK",
        },
      });
    });

    it("should get the correct userId when present", () => {
      const event = new GoogleAssistantEvent(newSurfaceIntent, {});
      expect(event.user.id).to.equal("1527283153072");
      expect(event.dialogflow.conv.user.storage).to.deep.equal({
        voxa: { userId: "1527283153072" },
      });
    });

    it("should generate a new userId when missing", () => {
      const event = new GoogleAssistantEvent(confirmationIntent, {});
      expect(event.user.id).to.not.be.undefined;
      expect(event.dialogflow.conv.user.storage).to.deep.equal({
        voxa: { userId: event.user.userId },
      });
    });
  });

  describe("Google Sign-In", () => {
    let voxaApp: VoxaApp;
    let googleAction: GoogleAssistantPlatform;

    const googleResponse: any = {
      aud: "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
      email: "johndoe@example.com",
      email_verified: true,
      exp: 1542221437,
      family_name: "Doe",
      given_name: "John",
      iat: 1542217837,
      iss: "https://accounts.google.com",
      jti: "1234567890abcdefghijklmnopqrstuvwxyz",
      name: "John Doe",
      nbf: 1542217537,
      picture:
        "https://abc.googleusercontent.com/-abcdefghijok/AAAAAAAAAAI/AAAAAAAACe0/123456789/s96-c/photo.jpg",
      sub: "12345678901234567899",
    };

    beforeEach(() => {
      voxaApp = new VoxaApp({ views, variables });
      googleAction = new GoogleAssistantPlatform(voxaApp, { clientId: "clientId" });

      const userDetailsMocked: any = _.cloneDeep(googleResponse);
      simple
        .mock(GoogleAssistantEvent.prototype, "verifyProfile")
        .resolveWith(userDetailsMocked);
    });

    afterEach(() => {
      simple.restore();
    });

    it("should validate user information", async () => {
      const launchIntentWithIdToken = _.cloneDeep(launchIntent);
      const pathToIdToken = "originalDetectIntentRequest.payload.user.idToken";
      _.set(launchIntentWithIdToken, pathToIdToken, "idToken");

      const event = new GoogleAssistantEvent(launchIntentWithIdToken, {});
      event.platform = googleAction;

      const userInformation = await event.getUserInformation();

      const detailsReworked: any = _.cloneDeep(googleResponse);
      detailsReworked.emailVerified = detailsReworked.email_verified;
      detailsReworked.familyName = detailsReworked.family_name;
      detailsReworked.givenName = detailsReworked.given_name;

      delete detailsReworked.email_verified;
      delete detailsReworked.family_name;
      delete detailsReworked.given_name;

      expect(userInformation).to.deep.equal(detailsReworked);
    });

    it("should throw an error when idToken is empty", async () => {
      const event = new GoogleAssistantEvent(launchIntent, {});
      event.platform = googleAction;

      let exceptionWasThrown: boolean = false;

      try {
        await event.getUserInformation();
      } catch (err) {
        exceptionWasThrown = true;
        expect(err.message).to.equal("conv.user.profile.token is empty");
      }

      expect(exceptionWasThrown).to.be.true;
    });
  });
});
