import assert from 'assert';
// @ts-ignore
import disDat from 'dis-dat';
import isVersion from 'is-version';
import Pinkie from 'pinkie-promise';
import getLines from '../lib/getLines.ts';

function isError(obj) {
  return Object.prototype.toString.call(obj) === '[object Error]';
}

describe('library', () => {
  (() => {
    // patch and restore promise
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();

  describe('sequential', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(isVersion(getLines(results[1].result.stdout).slice(-2)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' });
      assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
      assert.ok(isVersion(getLines(results[1].result.stdout).slice(-2)[0], 'v'));
    });
    it('handles errors - stops in dtd', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err) => {
        assert.ok(!!err);
        const results = err.results;
        assert.ok(results.length === 2);
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(results[1].error);
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(!results[1].error);
        assert.ok(isError(results[1].result));
        assert.ok(isVersion(getLines(results[2].result.stdout).slice(-2)[0], 'v'));
        done();
      });
    });
  });

  describe('parallel', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(isVersion(getLines(results[1].result.stdout).slice(-2)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' });
      assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
      assert.ok(isVersion(getLines(results[1].result.stdout).slice(-2)[0], 'v'));
    });
    it('handles errors - continues in dad', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(results[1].error);
        assert.ok(isVersion(getLines(results[2].result.stdout).slice(-2)[0], 'v'));
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(results[0].result.stdout).slice(-2)[0], 'hello');
        assert.ok(!results[1].error);
        assert.ok(isError(results[1].result));
        assert.ok(isVersion(getLines(results[2].result.stdout).slice(-2)[0], 'v'));
        done();
      });
    });
  });
});
