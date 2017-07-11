'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const Reply = require('../lib/Reply');
const AlexaEvent = require('../lib/AlexaEvent');

describe('Reply', () => {
  let reply;
  beforeEach(() => {
    reply = new Reply(new AlexaEvent({}));
  });

  it('should throw an error if first argument is not an alexaEvent', () => {
    expect(() => new Reply()).to.throw(Error);
  });

  it('should add the request session to itself on constructor', () => {
    const request = new AlexaEvent({ session: { key1: 'value1', key2: 'value2' } });
    const sessionReply = new Reply(request);
    expect(sessionReply.session).to.deep.equal(request.session);
  });

  it('should set yield to true on end', () => {
    reply.end();
    expect(reply.msg.yield).to.be.true;
  });

  describe('toSSML', () => {
    it('should not wrap already wrapped statements', () => {
      expect(Reply.toSSML('<speak>Say Something</speak>')).to.equal('<speak>Say Something</speak>');
    });
  });

  describe('createSpeechObject', () => {
    it('should return undefined if no optionsParam', () => {
      expect(Reply.createSpeechObject()).to.be.undefined;
    });

    it('should return an SSML response if optionsParam.type === SSML', () => {
      expect(Reply.createSpeechObject({ type: 'SSML', speech: '<speak>Say Something</speak>' })).to.deep.equal({
        type: 'SSML',
        ssml: '<speak>Say Something</speak>',
      });
    });

    it('should return a PlainText with optionsParam as text if no optionsParam.speech', () => {
      expect(Reply.createSpeechObject('Say Something')).to.deep.equal({
        type: 'PlainText',
        text: 'Say Something',
      });
    });

    it('should return a PlainText as default type if optionsParam.type is missing', () => {
      expect(Reply.createSpeechObject({ speech: 'Say Something' })).to.deep.equal({
        type: 'PlainText',
        text: 'Say Something',
      });
    });
  });

  describe('toJSON', () => {
    it('should generate a correct alexa response that doesn\'t  end a session for an ask response', () => {
      reply.append({ ask: 'ask' });
      expect(reply.toJSON()).to.deep.equal({
        response: {
          card: undefined,
          outputSpeech: {
            ssml: '<speak>ask</speak>',
            type: 'SSML',
          },
          shouldEndSession: false,
        },
        sessionAttributes: {},
        version: '1.0',
      });
    });
    it('should generate a correct alexa response that ends a session for a tell response', () => {
      reply.append({ tell: 'tell' });
      expect(reply.toJSON()).to.deep.equal({
        response: {
          card: undefined,
          outputSpeech: {
            ssml: '<speak>tell</speak>',
            type: 'SSML',
          },
          shouldEndSession: true,
        },
        sessionAttributes: {},
        version: '1.0',
      });
    });
  });

  describe('append', () => {
    it('should throw an error on trying to append to a yielding reply', () => {
      expect(() => reply.end().append({ say: 'Something' })).to.throw(Error);
    });

    it('should throw an error on trying to append after an ask', () => {
      expect(() => reply.append({ ask: 'something' }).append({ say: 'too' })).to.throw(Error);
    });

    it('should throw an error on trying to append after a tell', () => {
      expect(() => reply.append({ tell: 'something' }).append({ say: 'there' })).to.throw(Error);
    });

    it('should not throw an error on trying to append after a say', () => {
      expect(() => reply.append({ say: 'something' }).append({ say: 'there' })).to.not.throw;
    });

    it('should add the reprompt if message has one', () => {
      reply.append({ reprompt: 'reprompt' });
      expect(reply.msg.reprompt).to.equal('reprompt');
    });

    it('should ignore invalid messages', () => {
      reply.append(null);
      expect(reply.msg.statements).to.be.empty;
    });

    _.forEach(['ask', 'tell', 'say'], (key) => {
      it(`it should add a ${key} statement to the message statements`, () => {
        const message = { };
        message[key] = key;
        reply.append(message);

        expect(reply.msg.statements).to.have.lengthOf(1);
        expect(reply.msg.statements[0]).to.equal(key);
      });
    });

    it('should not yield if message is ask', () => {
      const message = { ask: 'ask' };
      reply.append(message);
      expect(reply.isYielding()).to.be.true;
    });

    it('should not yield if message is tell', () => {
      const message = { tell: 'tell' };
      reply.append(message);
      expect(reply.isYielding()).to.be.true;
    });

    it('should yield if message is say', () => {
      const message = { say: 'say' };
      reply.append(message);
      expect(reply.isYielding()).to.be.false;
    });

    it('should add cards to reply.msg', () => {
      const message = { card: { key: 'value' } };
      reply.append(message);
      expect(reply.msg.card).to.deep.equal(message.card);
    });

    it('should preserve last card that was added', () => {
      const message = { card: { key: 'value' } };
      reply.append(message);
      reply.append({ ask: 'ask' });
      expect(reply.msg.card).to.deep.equal(message.card);
      expect(reply.msg.statements).to.have.lengthOf(1);
      expect(reply.msg.statements[0]).to.equal('ask');
    });

    it('should allow directives to be objects', () => {
      const message = { directives: { key: 'value' } };
      reply.append(message);
      reply.append({ ask: 'ask' });
      expect(reply.msg.directives[0]).to.deep.equal(message.directives);
      expect(reply.msg.statements).to.have.lengthOf(1);
      expect(reply.msg.statements[0]).to.equal('ask');
    });

    it('should allow sending multiple directives', () => {
      const message = { directives: [{ type: 'a' }, { type: 'b' }] };
      reply.append(message);
      reply.append({ ask: 'ask' });
      expect(reply.msg.directives).to.deep.equal(message.directives);
      expect(reply.msg.directives).to.have.length(2);
    });

    it('should concatenate directives', () => {
      const message = { directives: [{ type: 'a' }] };
      reply.append(message);
      reply.append(message);
      expect(reply.msg.directives).to.have.length(2);
    });

    it('should convert legacy play format into the cannonical one', () => {
      const message = { directives: {
        type: 'AudioPlayer.Play',
        playBehavior: 'REPLACE_ALL',
        token: 'token',
        url: 'url',
        offsetInMilliseconds: 0,
      } };
      reply.append(message);
      expect(reply.msg.directives).to.have.length(1);
      expect(reply.msg.directives[0].audioItem.stream.token).to.equal('token');
      expect(reply.msg.directives[0].audioItem.stream.url).to.equal('url');
    });

    it('should set hasAnAsk to true if message is ask', () => {
      reply.append({ ask: 'ask' });
      expect(reply.msg.hasAnAsk).to.be.true;
    });

    describe('a Reply', () => {
      let appendedReply;
      beforeEach(() => {
        appendedReply = new Reply(new AlexaEvent({}));
      });

      it('should append the statements from another Reply', () => {
        appendedReply.append({ say: 'appended say' });
        reply.append(appendedReply);

        expect(reply.msg.statements).to.have.lengthOf(1);
        expect(reply.msg.statements[0]).to.equal('appended say');
      });

      it('should set hasAnAsk to true if reply has an ask', () => {
        appendedReply.append({ ask: 'ask' });
        reply.append(appendedReply);

        expect(reply.msg.hasAnAsk).to.be.true;
      });

      it('should not yield if reply has an ask', () => {
        appendedReply.append({ ask: 'ask' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should not yield if reply has a tell', () => {
        appendedReply.append({ tell: 'tell' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should yield if reply is say', () => {
        appendedReply.append({ say: 'say' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.false;
      });

      it('should not yield on tell after say', () => {
        appendedReply.append({ say: 'say' });
        appendedReply.append({ tell: 'tell' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should add cards to reply.msg', () => {
        appendedReply.append({ card: { key: 'value' } });
        reply.append(appendedReply);
        expect(reply.msg.card).to.deep.equal({ key: 'value' });
      });

      it('should add the reprompt if message has one', () => {
        appendedReply.append({ reprompt: 'reprompt' });
        reply.append(appendedReply);
        expect(reply.msg.reprompt).to.equal('reprompt');
      });
    });
  });
});
