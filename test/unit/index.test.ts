import assert from 'assert';
import type { DisDatResult } from 'dis-dat';
import disDat from 'dis-dat';
import isVersion from 'is-version';
import Pinkie from 'pinkie-promise';
import getLines from '../lib/getLines.ts';

function isError(obj: unknown) {
  return Object.prototype.toString.call(obj) === '[object Error]';
}

function getResult(arr: DisDatResult[], index: number): DisDatResult {
  const r = arr[index];
  if (!r) throw new Error(`Result ${index} missing`);
  return r;
}

function getStdout(r: DisDatResult): string | Buffer {
  if (!r.result) throw new Error('SpawnResult missing');
  return r.result.stdout;
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
        if (err) return done(err);
        if (!results) {
          done(new Error('No results'));
          return;
        }
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(isVersion(getLines(getStdout(getResult(results, 1))).slice(-2)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' });
      assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
      assert.ok(isVersion(getLines(getStdout(getResult(results, 1))).slice(-2)[0], 'v'));
    });
    it('handles errors - stops in dtd', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err) => {
        assert.ok(!!err);
        const results = err.results ?? [];
        assert.ok(results.length === 2);
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(getResult(results, 1).error);
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        if (!results) {
          done(new Error('No results'));
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(!getResult(results, 1).error);
        assert.ok(isError(getResult(results, 1).result));
        assert.ok(isVersion(getLines(getStdout(getResult(results, 2))).slice(-2)[0], 'v'));
        done();
      });
    });
  });

  describe('parallel', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        if (!results) {
          done(new Error('No results'));
          return;
        }
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(isVersion(getLines(getStdout(getResult(results, 1))).slice(-2)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' });
      assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
      assert.ok(isVersion(getLines(getStdout(getResult(results, 1))).slice(-2)[0], 'v'));
    });
    it('handles errors - continues in dad', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        if (!results) {
          done(new Error('No results'));
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(getResult(results, 1).error);
        assert.ok(isVersion(getLines(getStdout(getResult(results, 2))).slice(-2)[0], 'v'));
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        if (!results) {
          done(new Error('No results'));
          return;
        }
        assert.ok(results.length === 3);
        assert.equal(getLines(getStdout(getResult(results, 0))).slice(-2)[0], 'hello');
        assert.ok(!getResult(results, 1).error);
        assert.ok(isError(getResult(results, 1).result));
        assert.ok(isVersion(getLines(getStdout(getResult(results, 2))).slice(-2)[0], 'v'));
        done();
      });
    });
  });
});
