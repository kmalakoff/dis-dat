var assert = require('assert');
var isVersion = require('is-version');

var disDat = require('../..');

var EOL = process.platform === 'win32' ? '\r\n' : '\n';

describe('library', function () {
  describe('happy path', function () {
    it('basic command', function (done) {
      disDat(['npm --version', 'node --version'], { concurrency: 1, stdout: 'string' }, function (err, results) {
        assert.ok(!err);
        assert.ok(isVersion(results[0].result.stdout.split(EOL).slice(-2, -1)[0]));
        assert.ok(isVersion(results[1].result.stdout.split(EOL).slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', function (done) {
      if (typeof Promise === 'undefined') return;

      disDat(['npm --version', 'node --version'], { concurrency: Infinity, stdout: 'string' })
        .then(function (results) {
          assert.ok(isVersion(results[0].result.stdout.split(EOL).slice(-2, -1)[0]));
          assert.ok(isVersion(results[1].result.stdout.split(EOL).slice(-2, -1)[0], 'v'));
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });
});
