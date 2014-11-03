'use strict';
var simple = require('./index');
var util = require('util');
var assert = require('assert');

describe('simple', function() {
  describe('spy()', function() {
    var originalFn;
    var spyFn;

    describe('for noop function', function() {
      beforeEach(function() {
        spyFn = simple.spy(function(){});
      });

      it('can be queried without having been called', function() {
        assert.equal(spyFn.callCount, 0);
        assert.deepEqual(spyFn.calls, []);
        assert(spyFn.lastCall);
        assert.deepEqual(spyFn.lastCall.args, []);
      });

      it('can be queried for arguments on a single call', function() {
        spyFn('with', 'args');

        assert(spyFn.called);
        assert.equal(spyFn.callCount, 1);
        assert(spyFn.calls);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall, spyFn.lastCall);
        assert.equal(spyFn.firstCall, spyFn.calls[0]);
        assert.deepEqual(spyFn.lastCall.args, ['with', 'args']);
      });

      it('can be queried for arguments over multiple calls', function() {
        spyFn('with', 'args');
        spyFn('and');
        spyFn('more', 'args');

        assert(spyFn.called);
        assert.equal(spyFn.callCount, 3);
        assert(spyFn.calls);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall, spyFn.calls[0]);
        assert.deepEqual(spyFn.firstCall.args, ['with', 'args']);
        assert(spyFn.calls[1]);
        assert.deepEqual(spyFn.calls[1].args, ['and']);
        assert(spyFn.lastCall);
        assert.equal(spyFn.lastCall, spyFn.calls[2]);
        assert.deepEqual(spyFn.lastCall.args, ['more', 'args']);
      });
    });

    describe('for a throwing function', function() {
      beforeEach(function() {
        var i = 0;

        originalFn = function() {
          throw new Error(i++);
        };

        spyFn = simple.spy(originalFn);
      });

      it('can be queried without having been called', function() {
        assert(!spyFn.called);
        assert.equal(spyFn.callCount, 0);
        assert.deepEqual(spyFn.calls, []);
        assert(spyFn.lastCall);
        assert.equal(spyFn.lastCall.threw, undefined);
      });

      it('can be queried for what it threw on a single call', function() {
        var threw;
        try {
          spyFn();
        } catch (e) {
          threw = e;
        }

        assert(threw);
        assert(spyFn.called);
        assert.equal(spyFn.callCount, 1);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall.threw, threw);
      });

      it('can be queried for what it threw over multiple calls', function() {
        var threw = [];
        try {
          spyFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          spyFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          spyFn();
        } catch (e) {
          threw.push(e);
        }

        assert.equal(threw.length, 3);
        assert(spyFn.called);
        assert.equal(spyFn.callCount, 3);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall.threw, threw[0]);
        assert.equal(spyFn.calls[1].threw, threw[1]);
        assert.equal(spyFn.lastCall.threw, threw[2]);
      });
    });

    describe('for a returning function', function() {
      beforeEach(function() {
        var i = 1;

        originalFn = function() {
          return i++;
        };

        spyFn = simple.spy(originalFn);
      });

      it('can be queried without having been called', function() {
        assert(!spyFn.called);
        assert.equal(spyFn.callCount, 0);
        assert.deepEqual(spyFn.calls, []);
        assert(spyFn.lastCall);
        assert.equal(spyFn.lastCall.returned, undefined);
      });

      it('can be queried for what it threw on a single call', function() {
        var returned;

        returned = spyFn();

        assert(returned);
        assert.equal(spyFn.callCount, 1);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall.returned, returned);
      });

      it('can be queried for what it threw over multiple calls', function() {
        var returned = [];

        returned.push(spyFn());
        returned.push(spyFn());
        returned.push(spyFn());

        assert.equal(returned.length, 3);
        assert(spyFn.called);
        assert.equal(spyFn.callCount, 3);
        assert(spyFn.firstCall);
        assert.equal(spyFn.firstCall.returned, returned[0]);
        assert.equal(spyFn.calls[1].returned, returned[1]);
        assert.equal(spyFn.lastCall.returned, returned[2]);
      });
    });
  });

  describe('stub()', function() {
    var stubFn;

    describe('for a single callback configuration', function() {
      beforeEach(function() {
        stubFn = simple.stub().callbackWith(1, 2, 3);
      });

      it('can call back with arguments', function() {
        stubFn('a', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 1);
          assert.equal(stubFn.lastCall.args[0], 'a');
          assert.equal(arguments.length, 3);
          assert.equal(arguments[0], 1);
          assert.equal(arguments[1], 2);
          assert.equal(arguments[2], 3);
        });
      });

      it('can call back with arguments, over multiple calls', function() {
        stubFn('a', function() {});
        stubFn('b', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 2);
          assert.equal(stubFn.lastCall.args[0], 'b');
          assert.equal(arguments.length, 3);
          assert.equal(arguments[0], 1);
          assert.equal(arguments[1], 2);
          assert.equal(arguments[2], 3);
        });
      });
    });

    describe('for a multiple callback configurations', function() {
      beforeEach(function() {
        stubFn = simple.stub().callbackWith(1).callbackWith(2).callbackWith(3);
      });

      it('can call back once with arguments', function() {
        stubFn('a', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 1);
          assert.equal(stubFn.lastCall.args[0], 'a');
          assert.equal(arguments[0], 1);
        });
      });

      it('can call back with arguments, over multiple calls, looping per default', function() {
        stubFn('a', function() {});
        stubFn('b', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 2);
          assert.equal(stubFn.lastCall.args[0], 'b');
          assert.equal(arguments[0], 2);
        });
        stubFn('c', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 3);
          assert.equal(stubFn.lastCall.args[0], 'c');
          assert.equal(arguments[0], 3);
        });
        stubFn('d', function() {
          assert(stubFn.callCount, 4);
          assert.equal(stubFn.lastCall.args[0], 'd');
          assert.equal(arguments[0], 1);
        });
      });

      it('can call back with arguments, over multiple calls, looping turned off', function() {
        stubFn.loop = false;
        stubFn('a', function() {});
        stubFn('b', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 2);
          assert.equal(stubFn.lastCall.args[0], 'b');
          assert.equal(arguments[0], 2);
        });
        stubFn('c', function() {
          assert(stubFn.called);
          assert(stubFn.callCount, 3);
          assert.equal(stubFn.lastCall.args[0], 'c');
          assert.equal(arguments[0], 3);
        });
        var neverCalled = true;
        stubFn('d', function() {
          neverCalled = false;
        });
        assert(neverCalled);
      });
    });

    describe('for a single throwing configuration', function() {
      beforeEach(function() {
        stubFn = simple.stub().throwWith(new Error('example'));
      });

      it('can throw', function() {
        var threw;
        try {
          stubFn();
        } catch (e) {
          threw = e;
        }

        assert(threw);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 1);
        assert.equal(threw.message, 'example');
      });

      it('can throw over multiple calls, looping per default', function() {
        var threw = [];
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }

        assert.equal(threw.length, 2);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 2);
        assert.equal(threw[0], threw[1]);
        assert.equal(threw[0].message, 'example');
      });
    });

    describe('for a multiple throwing configurations', function() {
      beforeEach(function() {
        stubFn = simple.stub().throwWith(new Error('a')).throwWith(new Error('b'));
      });

      it('can throw', function() {
        var threw;
        try {
          stubFn();
        } catch (e) {
          threw = e;
        }

        assert(threw);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 1);
        assert.equal(threw.message, 'a');
      });

      it('can throw over multiple calls, looping per default', function() {
        var threw = [];
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }

        assert.equal(threw.length, 3);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 3);
        assert.equal(threw[0].message, 'a');
        assert.equal(threw[1].message, 'b');
        assert.equal(threw[2].message, 'a');
      });

      it('can throw over multiple calls, looping turned off', function() {
        stubFn.loop = false;

        var threw = [];
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }
        try {
          stubFn();
        } catch (e) {
          threw.push(e);
        }

        assert.equal(threw.length, 2);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 3);
        assert.equal(threw[0].message, 'a');
        assert.equal(threw[1].message, 'b');
      });
    });

    describe('for a single returning configuration', function() {
      beforeEach(function() {
        stubFn = simple.stub().returnWith('example');
      });

      it('can return', function() {
        var returned;
        returned = stubFn();

        assert(returned);
        assert.equal(stubFn.callCount, 1);
        assert.equal(returned, 'example');
      });

      it('can return over multiple calls, looping per default', function() {
        var returned = [];
        returned.push(stubFn());
        returned.push(stubFn());

        assert.equal(returned.length, 2);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 2);
        assert.equal(returned[0], returned[1]);
        assert.equal(returned[0], 'example');
      });
    });

    describe('for a multiple returning configurations', function() {
      beforeEach(function() {
        stubFn = simple.stub().returnWith('a').returnWith('b');
      });

      it('can return', function() {
        var returned;
        returned = stubFn();

        assert(returned);
        assert.equal(stubFn.callCount, 1);
        assert.equal(returned, 'a');
      });

      it('can return over multiple calls, looping per default', function() {
        var returned = [];
        returned.push(stubFn());
        returned.push(stubFn());
        returned.push(stubFn());

        assert.equal(returned.length, 3);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 3);
        assert.equal(returned[0], 'a');
        assert.equal(returned[1], 'b');
        assert.equal(returned[2], 'a');
      });

      it('can return over multiple calls, looping turned off', function() {
        stubFn.loop = false;

        var returned = [];
        returned.push(stubFn());
        returned.push(stubFn());
        returned.push(stubFn());

        assert.equal(returned.length, 3);
        assert(stubFn.called);
        assert.equal(stubFn.callCount, 3);
        assert.equal(returned[0], 'a');
        assert.equal(returned[1], 'b');
        assert.equal(returned[2], undefined);
      });
    });

    describe('for mixed configurations', function() {

    });
  });

  describe('mock()', function() {
    var obj;

    describe('on a object with prototype', function() {
      var ProtoKlass;

      before(function() {
        ProtoKlass = function ProtoKlass(){};
        ProtoKlass.prototype.protoValue = 'x';
        ProtoKlass.prototype.protoFn = function() {
          return 'x';
        };
      });

      beforeEach(function() {
        obj = new ProtoKlass();
      });

      it('can mock instance values over its prototype\'s and restore', function() {
        simple.mock(obj, 'protoValue', 'y');
        assert.equal(obj.protoValue, 'y');
        simple.restore();
        assert.equal(obj.protoValue, 'x');
      });

      it('can mock with custom instance functions over its prototype\'s and restore', function() {
        simple.mock(obj, 'protoFn', function() {
          return 'y';
        });
        assert.equal(obj.protoFn(), 'y');
        assert(obj.protoFn.called);
        simple.restore();
        assert.equal(obj.protoFn(), 'x');
      });

      it('can mock with stubbed functions over its prototype\'s and restore', function() {
        simple.mock(obj, 'protoFn').returnWith('y');
        assert.equal(obj.protoFn(), 'y');
        assert(obj.protoFn.called);
        simple.restore();
        assert.equal(obj.protoFn(), 'x');
      });
    });

    describe('on an anonymous object', function() {
      beforeEach(function() {
        obj = {
          a: 'a',
          b: 'b',
          c: 'c',
          fnD: function() {
            return 'd';
          }
        };
      });

      it('can mock instance values and restore', function() {
        var beforeKeys = Object.keys(obj);
        simple.mock(obj, 'a', 'd');
        simple.mock(obj, 'd', 'a');
        assert.equal(obj.a, 'd');
        assert.equal(obj.d, 'a');
        simple.restore();
        assert.equal(obj.a, 'a');
        assert.equal(obj.d, undefined);
        assert.deepEqual(Object.keys(obj), beforeKeys);
      });

      it('can mock with spy on pre-existing functions and restore', function() {
        simple.mock(obj, 'fnD').returnWith('a');
        assert.equal(obj.fnD(), 'a');
        assert(obj.fnD.called);
        simple.restore();
        assert.equal(obj.fnD(), 'd');
      });

      it('can mock with newly stubbed functions and restore', function() {
        simple.mock(obj, 'fnA').returnWith('a');
        assert.equal(obj.fnA(), 'a');
        assert(obj.fnA.called);
        simple.restore();
        assert.equal(obj.fnA, undefined);
      });
    });
  });
});