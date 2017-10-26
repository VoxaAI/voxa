'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const VoxaReply = require('../lib/VoxaReply');
const AlexaEvent = require('../lib/adapters/alexa/AlexaEvent');

describe('VoxaReply', () => {
  let reply;
  beforeEach(() => {
    reply = new VoxaReply(new AlexaEvent({}));
  });

  it('should throw an error if first argument is not an alexaEvent', () => {
    expect(() => new VoxaReply()).to.throw(Error);
  });

  it('should add the request session to itself on constructor', () => {
    const request = new AlexaEvent({ session: { key1: 'value1', key2: 'value2' } });
    const sessionReply = new VoxaReply(request);
    expect(sessionReply.session).to.deep.equal(request.session);
  });

  it('should set yield to true on end', () => {
    reply.end();
    expect(reply.msg.yield).to.be.true;
  });

  describe('createSpeechObject', () => {
    it('should return undefined if no optionsParam', () => {
      expect(VoxaReply.createSpeechObject()).to.be.undefined;
    });

    it('should return an SSML response if optionsParam.type === SSML', () => {
      expect(VoxaReply.createSpeechObject({ type: 'SSML', speech: '<speak>Say Something</speak>' })).to.deep.equal({
        type: 'SSML',
        ssml: '<speak>Say Something</speak>',
      });
    });

    it('should return a PlainText with optionsParam as text if no optionsParam.speech', () => {
      expect(VoxaReply.createSpeechObject('Say Something')).to.deep.equal({
        type: 'PlainText',
        text: 'Say Something',
      });
    });

    it('should return a PlainText as default type if optionsParam.type is missing', () => {
      expect(VoxaReply.createSpeechObject({ speech: 'Say Something' })).to.deep.equal({
        type: 'PlainText',
        text: 'Say Something',
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
      expect(reply.msg.reprompts).to.deep.equal(['reprompt']);
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

    it('should allow hint directives or hint message', () => {
      const message = {
        supportDisplayInterface: true,
        directives: [
          {
            hint: 'special Hint',
          },
          { type: 'b' },
        ],
      };

      reply.append(message);
      expect(reply.msg.directives).to.deep.equal([
        {
          type: 'Hint',
          hint: {
            type: 'PlainText',
            text: 'special Hint',
          },
        },
        { type: 'b' },
      ]);
    });

    it('should concatenate directives', () => {
      const message = { directives: [{ type: 'a' }] };
      reply.append(message);
      reply.append(message);
      expect(reply.msg.directives).to.have.length(2);
    });

    it('should throw error on duplicate hint directives', () => {
      const message = { supportDisplayInterface: true, directives: [{ type: 'Hint' }, { type: 'Hint' }] };
      expect(reply.append.bind(reply, message)).to.throw('At most one Hint directive can be specified in a response');
    });

    it('should throw error on duplicate Display Render directives', () => {
      const message = { supportDisplayInterface: true, directives: [{ type: 'Display.RenderTemplate' }, { type: 'Display.RenderTemplate' }] };
      expect(reply.append.bind(reply, message)).to.throw('At most one Display.RenderTemplate directive can be specified in a response');
    });

    it('should throw error on both AudioPlayer.Play and VideoApp.Launch directives', () => {
      const message = { directives: [{ type: 'AudioPlayer.Play' }, { type: 'VideoApp.Launch' }] };
      expect(reply.append.bind(reply, message)).to.throw('Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response');
    });

    it('should convert legacy play format into the cannonical one', () => {
      const message = {
        directives: {
          type: 'AudioPlayer.Play',
          playBehavior: 'REPLACE_ALL',
          token: 'token',
          url: 'url',
          offsetInMilliseconds: 0,
        },
      };
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
        appendedReply = new VoxaReply(new AlexaEvent({}));
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
        expect(reply.msg.reprompts).to.deep.equal(['reprompt']);
      });
    });
  });
});
