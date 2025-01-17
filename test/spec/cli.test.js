const assert = require('assert');
const path = require('path');
const spawn = require('cross-spawn-cb');
const getLines = require('../lib/getLines.cjs');
const isVersion = require('is-version');

const BIN = path.join(__dirname, '..', '..', 'bin');
const CLI_DTD = path.join(BIN, 'dtd.cjs');
const CLI_DAD = path.join(BIN, 'dad.cjs');

describe('cli', () => {
  describe('happy path', () => {
    it('basic command - sequential', (done) => {
      spawn(CLI_DTD, ['--silent', 'echo "hello"', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err.message);
        const lines = getLines(res.stdout);
        assert.equal(lines.slice(-2)[0], 'hello');
        assert.ok(isVersion(lines.slice(-1)[0], 'v'));
        done();
      });
    });

    it('basic command - parallel', (done) => {
      spawn(CLI_DAD, ['--silent', 'echo "hello"', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err.message);
        const lines = getLines(res.stdout);
        const versions = lines.slice(-2);
        assert.ok(versions[0] === 'hello' || isVersion(versions[0], 'v'));
        assert.ok(versions[1] === 'hello' || isVersion(versions[1], 'v'));
        done();
      });
    });
    it('handles errors - stops in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', 'echo "hello"', 'this is an error', 'node --version'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(err.status !== 0);
        const lines = getLines(err.stdout);
        const versions = lines.slice(-2);
        assert.equal(versions.length, 1);
        assert.equal(versions[0], 'hello');
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', 'echo "hello"', '{this is an error}', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const lines = getLines(res.stdout);
        const versions = lines.slice(-2);
        assert.equal(versions.length, 2);
        assert.equal(versions[0], 'hello');
        done();
      });
    });
    it('handles errors - stops in dad', (done) => {
      spawn(CLI_DAD, ['--silent', 'echo "hello"', 'this is an error', 'node --version'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(err.status !== 0);
        const lines = getLines(err.stdout);
        const versions = lines.slice(-2);
        assert.equal(versions.length, 2);
        assert.ok(versions[0] === 'hello' || isVersion(versions[0], 'v'));
        assert.ok(versions[1] === 'hello' || isVersion(versions[1], 'v'));
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      spawn(CLI_DAD, ['--silent', 'echo "hello"', '{this is an error}', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const lines = getLines(res.stdout);
        const versions = lines.slice(-2);
        assert.equal(versions.length, 2);
        assert.ok(versions[0] === 'hello' || isVersion(versions[0], 'v'));
        assert.ok(versions[1] === 'hello' || isVersion(versions[1], 'v'));
        done();
      });
    });
  });

  describe('unhappy path', () => {
    it('missing command - sequential', (done) => {
      spawn(CLI_DAD, ['--silent'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(!!err);
        done();
      });
    });

    it('missing command - parallel', (done) => {
      spawn(CLI_DAD, ['--silent'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(!!err);
        done();
      });
    });
  });
});
