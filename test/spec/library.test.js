// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

const assert = require('assert');
const isVersion = require('is-version');
const cr = require('cr');

const disDat = require('dis-dat');

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
        assert.ok(!err, err ? err.message : '');
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
  });

  describe('parallel', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' }, (err, results) => {
        assert.ok(!err, err ? err.message : '');
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
  });
});
