/**
 * Alexa Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('chai').assert,
  AlexaSkill = require('../lib/AlexaSkill')
  ;

describe('AlexaSkill', function () {
	// var alexaSkill = new AlexaSkill('some-key');
	// it('onLaunch needs to be overriden', function () {
	//   expect(alexaSkill.eventHandlers.onLaunch())
				// .to.throw('onLaunch should be overriden by subclass')
	// });
	itIs('Speech output type SSML', AlexaSkill.speechOutputType.SSML, 'SSML');
});

function itIs(testName, actual, shouldBe) {
	it(testName, function () {
		assert.equal(actual, shouldBe);
	});
}
