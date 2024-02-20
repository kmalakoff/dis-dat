// remove NODE_OPTIONS from ts-dev-stack
// biome-ignore lint/performance/noDelete: <explanation>
delete process.env.NODE_OPTIONS;

const assert = require('assert');
const isVersion = require('is-version');
const cr = require('cr');

const disDat = require('dis-dat');

describe('library', () => {
  describe('happy path', () => {
    it('basic command', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' }, (err, results) => {
        assert.ok(!err);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', (done) => {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' })
        .then((results) => {
          assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
          assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
          done();
        })
        .catch((err) => {
          assert.ok(!err);
        });
    });
  });
});
