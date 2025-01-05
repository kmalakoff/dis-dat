const assert = require('assert');
const isVersion = require('is-version');
const cr = require('cr');

const disDat = require('dis-dat');

function isError(obj) {
  return Object.prototype.toString.call(obj) === '[object Error]';
}

describe('library', () => {
  (() => {
    // patch and restore promise
    let rootPromise;
    before(() => {
      rootPromise = global.Promise;
      global.Promise = require('pinkie-promise');
    });
    after(() => {
      global.Promise = rootPromise;
    });
  })();

  describe('sequential', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' });
      assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
      assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
    });
    it('handles errors - stops in dtd', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.ok(results.length === 2);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(results[1].error);
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.ok(results.length === 3);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(!results[1].error);
        assert.ok(isError(results[1].result));
        assert.ok(isVersion(cr(results[2].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
  });

  describe('parallel', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', async () => {
      const results = await disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' });
      assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
      assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
    });
    it('handles errors - continues in dad', (done) => {
      disDat(['echo "hello"', 'this is an error', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.ok(results.length === 3);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(results[1].error);
        assert.ok(isVersion(cr(results[2].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      disDat(['echo "hello"', '{this is an error}', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        if (err) return done(err);
        assert.ok(results.length === 3);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(!results[1].error);
        assert.ok(isError(results[1].result));
        assert.ok(isVersion(cr(results[2].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
  });
});
