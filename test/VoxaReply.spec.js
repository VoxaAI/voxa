'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const VoxaReply = require('../lib/VoxaReply');
const AlexaEvent = require('../lib/adapters/alexa/AlexaEvent');
const tools = require('./tools');

const rb = new tools.AlexaRequestBuilder();

describe('VoxaReply', () => {
  let reply;
  beforeEach(() => {
    reply = new VoxaReply(new AlexaEvent(rb.getIntentRequest()));
  });

  it('should throw an error if first argument is not an alexaEvent', () => {
    expect(() => new VoxaReply()).to.throw(Error);
  });

  it('should add the request session to itself on constructor', () => {
    const event = rb.getIntentRequest();
    rb.session = { key1: 'value1', key2: 'value2' };
    const request = new AlexaEvent(event);
    const sessionReply = new VoxaReply(request);
    expect(sessionReply.session).to.deep.equal(request.session);
  });

  it('should determine if it has directive', () => {
    const message = { directives: [{ type: 'a' }] };
    reply.append(message);

    expect(reply.hasDirective('a')).to.be.true;
    expect(reply.hasDirective(/^a/)).to.be.true;
    expect(reply.hasDirective(directive => directive.type === 'a')).to.be.true;

    expect(reply.hasDirective('b')).to.be.false;
    expect(reply.hasDirective(/^b/)).to.be.false;
    expect(reply.hasDirective(directive => directive.type === 'b')).to.be.false;
  });

  it('should throw error on unknown comparison for has directive', () => {
    const message = { directives: [{ type: 'a' }] };
    reply.append(message);

    expect(() => reply.hasDirective({})).to.throw(Error);
  });

  it('should set yield to true on yield', () => {
    reply.yield();
    expect(reply.msg.yield).to.be.true;
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
      expect(reply.msg.reprompt).to.deep.equal('reprompt');
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

    it('should yield if message is ask', () => {
      const message = { ask: 'ask' };
      reply.append(message);
      expect(reply.isYielding()).to.be.true;
    });

    it('should yield if message is tell', () => {
      const message = { tell: 'tell' };
      reply.append(message);
      expect(reply.isYielding()).to.be.true;
    });

    it('should not yield if message is say', () => {
      const message = { say: 'say' };
      reply.append(message);
      expect(reply.isYielding()).to.be.false;
    });

    it('should yield if has a dialog directive', () => {
      const message = { directives: { type: 'Dialog.Delegate' } };
      reply.append(message);
      expect(reply.isYielding()).to.be.true;
    });

    it('should not end session if it has a dialog directive', () => {
      const message = { directives: { type: 'Dialog.Delegate' } };
      reply.append(message);
      expect(reply.msg.terminate).to.be.false;
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

    describe('a Reply', () => {
      let appendedReply;
      beforeEach(() => {
        appendedReply = new VoxaReply(new AlexaEvent(rb.getIntentRequest()));
      });

      it('should append the statements from another Reply', () => {
        appendedReply.append({ say: 'appended say' });
        reply.append(appendedReply);

        expect(reply.msg.statements).to.have.lengthOf(1);
        expect(reply.msg.statements[0]).to.equal('appended say');
      });

      it('should yield if reply has an ask', () => {
        appendedReply.append({ ask: 'ask' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should yield if reply has a tell', () => {
        appendedReply.append({ tell: 'tell' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should not yield if reply is say', () => {
        appendedReply.append({ say: 'say' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.false;
      });

      it('should yield on tell after say', () => {
        appendedReply.append({ say: 'say' });
        appendedReply.append({ tell: 'tell' });
        reply.append(appendedReply);
        expect(reply.isYielding()).to.be.true;
      });

      it('should yield on delegate directive', () => {
        appendedReply.append({ directives: { type: 'Dialog.Delegate' } });
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
        expect(reply.msg.reprompt).to.deep.equal('reprompt');
      });
    });
  });
});
