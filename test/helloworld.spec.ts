import { AlexaPlatform } from "../src/platforms/alexa/AlexaPlatform";
import { VoxaApp } from "../src/VoxaApp";

const views = {
  launch: "Welcome to this voxa app, are you enjoying voxa so far?",
  likesVoxa: "Great! We're always working on improving Voxa and we're vey happy you found it useful",
  doesNotLikeVoxa: "Too bad! How can we make it better?",
};

const app = new VoxaApp({ views });

describe("Hello World", () => {

});
