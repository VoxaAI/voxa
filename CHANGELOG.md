# VOXA Changelog

## 3.3.1-alpha2 (2019-08-13)

#### Enhancement
* Add Browse Carousel directive usage to docs
* Updates i18next imports 

## 3.3.0 (2019-07-11)

#### New Feature
* Adds S3Persistence plugin

#### Enhancement
* Set not required play audio params in the interface
* Prioritize controllers with an intents array for the same state
* Set unused params as optionals in directives method



## 3.2.1 (2019-06-20)

#### Enhancement
* Adds CHANGELOG.md
* Updates alexa-directives docs



## 3.2.0 (2019-06-19)

#### New Feature
* Adds Digital Goods directive



## 3.1.3 (2019-06-10)

#### Enhancement
* Updates VOXA docs
* Updates VOXA's dependencies
* Updates PlayAudio directive



## 3.1.0 (2019-05-10)

#### New Feature
* Adds support for more features of Facebook Messenger

#### Bug Fix
* Fixes some issues when handling errors and localization

#### Enhancement
* Reduces voxa package size inside node_modules by removing docs and example files



## 3.1.0-alpha8 (2019-04-30)

#### Enhancement
* Version 3
* Updates description



## 3.1.0-alpha7 (2019-03-11)

#### New Feature
* Added Handover Protocol Facebook helpers
* Adding support for the elicit dialog directive in alexa

#### Enhancement
* Updates Google Assistant to allow for multiple simple responses
* Removing shouldEndSession
* Reply arrays



## 3.1.0-alpha6 (2019-02-25)

#### New Feature
* Added multi-bubbles support for Facebook



## 3.1.0-alpha5 (2019-02-15)

#### Bug Fix
* Various fixes with error classes and handling



## 3.1.0-alpha4 (2019-02-11)

#### Enhancement
* Separated Dialogflow integrations



## 3.1.0-alpha3 (2019-01-15)

#### Bug Fix
* Fixes another bug with actions on google userId



## 3.1.0-alpha2 (2019-01-15)

#### Bug Fix
* Fixes a bug with the google actions user Id



## 3.1.0-alpha (2019-01-09)

#### New Feature
* Added Facebook unlink directive



## 3.0.0 (2019-01-09)

## Breaking Changes

#### New Feature
* Now uses Typescript
* Support for Google Actions, Alexa, Botframework, Facebook Messenger and Telegram



## 3.0.0-alpha42 (2019-01-04)

#### Bug Fix
* Fixes a bug where facebook user id was not being populated



## 3.0.0-alpha41 (2019-01-03)

#### New Feature
* Alexa Proactive APIs
* Initial Facebook initial support
* Initial Telegram support

#### Enhancement
* Updated ask-sdk-model version



## 3.0.0-alpha40 (2018-12-18)

#### New Feature
* Alexa Reminders API support
* Alexa Skill Messaging API support

#### Enhancement
* Updates ask-sdk-model to version 1.10.1

#### Bug Fix
* Fixes a bug that prevented google actions suggestions from working when using the reply transition key



## 3.0.0-alpha39 (2018-12-04)

#### New Feature
* Adding LinkOutSuggestion support
* Adding displayText support for Google Actions


#### Enhancement
* Updated dependencies



## 3.0.0-alpha38 (2018-11-27)

#### New Feature
* New Alexa APL support

#### Bug Fix
* Fixes some bugs in the global intent handlers

#### Enhancement
* Now adding reply transition keys to the transition objects
* Updates internal ask-sdk-model dependency to the latest



## 3.0.0-alpha37 (2018-11-19)

#### Bug Fix
* Fixes a bug where onUnhandledState was not being called on some situations



## 3.0.0-alpha36 (2018-11-16)

#### New Feature
* Adds core methods to get user’s profile from LoginWithAmazon and Google Sign-In



## 3.0.0-alpha35 (2018-11-06)

#### Bug Fix
* Fixes a bug in the SM that prevented global intents from working as expected



## 3.0.0-alpha32 (2018-10-12)

#### Bug Fix
* New State Machine implementation



## 2.5.0 (2018-09-03)

#### New Feature
* Voxa native support for the following APIs: In-Skill Purchases, Lists, Device Address, Customer Contact, Device Settings



## 2.3.1 (2018-07-06)

#### Bug Fix
* Important fixes



## 2.3.0 (2018-07-06)

#### New Feature
* CanFulfillIntent support



## 3.0.0-alpha25 (2018-06-06)

#### New Feature
* More directives

#### Enhancement
* Some little documentation



## 2.2.0 (2017-10-27)

#### New Feature
* Newest support for video directives and a more flexible rendering system



## 2.1.5 (2017-08-29)

#### New Feature
* Multiple directives support

#### Enhancement
* More documentation
* Random views
* Gitter instead of IRC
* Better error messages

#### Bug Fix
* Fixes for the audio podcast sample by @mathmass



## 2.1.4 (2017-05-29)

#### Enhancement
* More documentation

#### Bug Fix
* Fixes for the serialize step
* Fixes for the I18N



## 2.1.3 (2017-05-18)

#### Bug Fix
* Fixes the issue where session.attributes.null causes a crash



## 2.1.2 (2017-04-18)

#### Bug Fix
* Fix for getting transition reply object when returning arrays as reply



## 2.1.1 (2017-04-18)

#### Enhancement
* Support for node 6.10



## 2.1.0 (2017-03-22)

#### New Feature
* Autoload plugin
* Work on a reprompt plugin
* Now allowing multiple replies in the { reply: ... } key
* Now raising an error when trying to render a missing view
* Added user accessor to AlexaEvent
* Started using travis and coveralls

#### Enhancement
* Development server and new skill.lambda() handler
* Now session attributes are only taken from serialize
* .editorconfig file

#### Bug Fix
* Fixes for the cloudwatch plugin
* Fixes for the state flow plugin



## 2.0.0 (2017-03-01)

#### New Feature
* First public relase

