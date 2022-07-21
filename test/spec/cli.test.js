var assert = require('assert');
var path = require('path');
var spawn = require('cross-spawn-cb');
var isVersion = require('is-version');
var cr = require('cr');

var BIN = path.join(__dirname, '..', '..', 'bin');

describe('cli', function () {
  describe('happy path', function () {
    it('basic command - sequential', function (done) {
      spawn(path.join(BIN, 'dis-then-dat.js'), ['--silent', 'npm --version', 'node --version'], { encoding: 'utf8' }, function (err, res) {
        assert.ok(!err);
        var lines = cr(res.stdout).split('\n');
        assert.ok(isVersion(lines.slice(-3, -2)[0]));
        assert.ok(isVersion(lines.slice(-2, -1)[0], 'v'));
        done();
      });
    });

    it('basic command - parallel', function (done) {
      spawn(path.join(BIN, 'dis-and-dat.js'), ['--silent', 'npm --version', 'node --version'], { encoding: 'utf8' }, function (err, res) {
        assert.ok(!err);
        var lines = cr(res.stdout).split('\n');
        var versions = lines.slice(-3, -1);
        assert.ok(isVersion(versions[0]) || isVersion(versions[0], 'v'));
        assert.ok(isVersion(versions[1]) || isVersion(versions[1], 'v'));
        done();
      });
    });
  });

  describe('unhappy path', function () {
    it('missing command - sequential', function (done) {
      spawn(path.join(BIN, 'dis-then-dat.js'), ['--silent'], { encoding: 'utf8' }, function (err, res) {
        assert.ok(!!err);
        done();
      });
    });

    it('missing command - parallel', function (done) {
      spawn(path.join(BIN, 'dis-and-dat.js'), ['--silent'], { encoding: 'utf8' }, function (err, res) {
        assert.ok(!!err);
        done();
      });
    });
  });
});
