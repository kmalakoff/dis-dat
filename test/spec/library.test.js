var assert = require('assert');
var isVersion = require('is-version');
var cr = require('cr');

var disDat = require('../..');

describe('library', function () {
  describe('happy path', function () {
    it('basic command', function (done) {
      disDat(['echo "hello"', 'node --version'], { concurrency: 1, encoding: 'utf8' }, function (err, results) {
        assert.ok(!err);
        assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
        assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
        done();
      });
    });
    it('basic command (promises)', function (done) {
      disDat(['echo "hello"', 'node --version'], { concurrency: Infinity, encoding: 'utf8' })
        .then(function (results) {
          assert.equal(cr(results[0].result.stdout).split('\n').slice(-2, -1)[0], 'hello');
          assert.ok(isVersion(cr(results[1].result.stdout).split('\n').slice(-2, -1)[0], 'v'));
          done();
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });
});
