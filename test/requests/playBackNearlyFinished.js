module.exports = {
  version: "1.0",
  context: {
    AudioPlayer: {
      offsetInMilliseconds: 4701,
      token: "{\"index\":1,\"shuffle\":0,\"loop\":0}",
      playerActivity: "PLAYING"
    },
    System: {
      application: {
        applicationId: "amzn1.ask.skill.efe8bf1e-7664-47ff-a2a7-8e1ccaf46af8"
      },
      user: {
        userId: "amzn1.ask.account.AENXJ6HUNZBQTVML2I2SLKCHRYPP5INGC4FJFIMRKP7OBUASDPZIMODLOR3N6PYMOFVJWBP264JG5V6A7RJGED6746SBKV37TZZDANSBQ4UU5KVHLHBLMCGI75PUGKCEIXLZTPG3TCYJMHNSQ2YVTKTOUMSAEQTWLDWO2KEI7SCZRORJ26LQ2A3D2QBDWMQMWJ7K7PT7E4CH74I"
      },
      device: {
        supportedInterfaces: {
          AudioPlayer: {}
        }
      }
    }
  },
  request: {
    type: "AudioPlayer.PlaybackNearlyFinished",
    requestId: "amzn1.echo-api.request.750d878b-33d6-474c-ba36-63335d6825a4",
    timestamp: "2016-10-07T16:57:44Z",
    locale: "en-US",
    token: "{\"index\":1,\"shuffle\":0,\"loop\":0}",
    offsetInMilliseconds: 4701
  }
};
