var assert = require('assert');
var path = require('path');
var spawn = require('cross-spawn-cb');
var isVersion = require('is-version');

var BIN = path.join(__dirname, '..', '..', 'bin');
var EOL = process.platform === 'win32' ? '\r\n' : '\n';

describe('cli', function () {
  describe('happy path', function () {
    it('basic command - sequential', function (done) {
      spawn(path.join(BIN, 'dis-then-dat'), ['--silent', 'npm --version', 'node --version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        assert.ok(isVersion(res.stdout.split(EOL).slice(-3, -2)[0]));
        assert.ok(isVersion(res.stdout.split(EOL).slice(-2, -1)[0], 'v'));
        done();
      });
    });

    it('basic command - parallel', function (done) {
      spawn(path.join(BIN, 'dis-and-dat'), ['--silent', 'npm --version', 'node --version'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.equal(res.code, 0);
        var versions = res.stdout.split(EOL).slice(-3, -1);
        assert.ok(isVersion(versions[0]) || isVersion(versions[0], 'v'));
        assert.ok(isVersion(versions[1]) || isVersion(versions[1], 'v'));
        done();
      });
    });
  });

  describe('unhappy path', function () {
    it('missing command - sequential', function (done) {
      spawn(path.join(BIN, 'dis-then-dat'), ['--silent'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.ok(res.code !== 0);
        done();
      });
    });

    it('missing command - parallel', function (done) {
      spawn(path.join(BIN, 'dis-and-dat'), ['--silent'], { stdout: 'string' }, function (err, res) {
        assert.ok(!err);
        assert.ok(res.code !== 0);
        done();
      });
    });
  });
});
