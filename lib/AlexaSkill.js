/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
    except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for
    the specific language governing permissions and limitations under the License.
*/
'use strict';

var _ = require('lodash'),
    Promise = require('bluebird');

function AlexaSkill(appId) {
    this._appId = appId;
}

AlexaSkill.speechOutputType = {
    PLAIN_TEXT: 'PlainText',
    SSML: 'SSML',
};

AlexaSkill.prototype.requestHandlers = {
    LaunchRequest: function LaunchRequest(event, context, response) {
        this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
    },

    IntentRequest: function IntentRequest(event, context, response) {
        this.eventHandlers.onIntent.call(this, event.request, event.session, response);
    },

    SessionEndedRequest: function SessionEndedRequest(event, context) {
      this.eventHandlers.onSessionEnded.call(this, event.request, event.session);
      context.succeed({ version: '1.0' });
    },
};

/**
 * Override any of the eventHandlers as needed
 */
AlexaSkill.prototype.eventHandlers = {
    /**
     * Called when the session starts.
     * Subclasses could have overriden this function to open any necessary resources.
     */
    onSessionStarted: function onSessionStarted(sessionStartedRequest, session) {},

    /**
     * Called when the user invokes the skill without specifying what they want.
     * The subclass must override this function and provide feedback to the user.
     */
    onLaunch: function onLaunch(launchRequest, session, response) {
        throw 'onLaunch should be overriden by subclass';
    },

    /**
     * Called when the user specifies an intent.
     */
    onIntent: function onIntent(intentRequest, session, response) {
        var intent = _.assign({
            params: _(intentRequest.intent.slots).map(function (s) {
                return [s.name, s.value];
            }).fromPairs().value(),
        }, intentRequest.intent),
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    },

    /**
     * Called when the user ends the session.
     * Subclasses could have overriden this function to close any open resources.
     */
    onSessionEnded: function onSessionEnded(sessionEndedRequest, session) {},
};

/**
 * Subclasses should override the intentHandlers with the functions to handle specific intents.
 */
AlexaSkill.prototype.intentHandlers = {};

AlexaSkill.prototype.execute = function (event, context) {
    var self = this;
    try {
        //console.log("session applicationId: " + event.session.application.applicationId);
        // Validate that this request originated from authorized source.
        if (this._appId && event.session.application.applicationId !== this._appId) {
            console.log('The applicationIds don\'t match : ' +
              event.session.application.applicationId + ' and ' + this._appId);
            throw 'Invalid applicationId';
        }

        if (!event.session.attributes) {
            event.session.attributes = {};
        }

        doStartupScripts.call(this, event).then(function() {
            // Route the request to the proper handler which may have been overriden.
            var requestHandler = self.requestHandlers[event.request.type];
            requestHandler.call(self, event, context, new Response(context, event.session));
        }).catch(function(err){
            console.log("Unexpected exception " + err);
            context.fail(err);
        });
    } catch (e) {
        console.log('Unexpected exception ' + e);
        context.fail(e);
    }
};

function doStartupScripts(event) {
    var self = this;
    var qNext = Promise.resolve();
    if (event.session.new) {
        qNext = Promise.try(function() {
            return self.eventHandlers.onSessionStarted.call(self, event.request, event.session);
        });
    }
    return qNext;
}

var Response = function Response(context, session) {
    this._context = context;
    this._session = session;
};

function createSpeechObject(optionsParam) {
    if (!optionsParam) return null;
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam.speech,
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam.speech || optionsParam,
        };
    }
}

Response.prototype = (function () {
    var buildSpeechletResponse = function buildSpeechletResponse(options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession: options.shouldEndSession,
            card: options.card,
        };
        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt),
            };
        }

        var returnResult = {
            version: '1.0',
            response: alexaResponse,
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }

        return returnResult;
    };

    return {
        tell: function tell(speechOutput, card) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                card: card,
                shouldEndSession: true,
            }));
        },

        ask: function ask(speechOutput, repromptSpeech, card) {
            this._context.succeed(buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                card: card,
                shouldEndSession: false,
            }));
        },
    };
})();

module.exports = AlexaSkill;