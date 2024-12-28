// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

const assert = require('assert');
const path = require('path');
const spawn = require('cross-spawn-cb');
const isVersion = require('is-version');
const cr = require('cr');

const BIN = path.join(__dirname, '..', '..', 'bin');

describe('cli', () => {
  describe('happy path', () => {
    it('basic command - sequential', (done) => {
      spawn(path.join(BIN, 'dtd.js'), ['--silent', 'echo "hello"', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err, err ? err.message : '');
        const lines = cr(res.stdout).split('\n');
        assert.equal(lines.slice(-3, -2)[0], 'hello');
        assert.ok(isVersion(lines.slice(-2, -1)[0], 'v'));
        done();
      });
    });

    it('basic command - parallel', (done) => {
      spawn(path.join(BIN, 'dad.js'), ['--silent', 'echo "hello"', 'node --version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err, err ? err.message : '');
        const lines = cr(res.stdout).split('\n');
        const versions = lines.slice(-3, -1);
        assert.ok(versions[0] === 'hello' || isVersion(versions[0], 'v'));
        assert.ok(versions[1] === 'hello' || isVersion(versions[1], 'v'));
        done();
      });
    });
  });

  describe('unhappy path', () => {
    it('missing command - sequential', (done) => {
      spawn(path.join(BIN, 'dtd.js'), ['--silent'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(!!err);
        done();
      });
    });

    it('missing command - parallel', (done) => {
      spawn(path.join(BIN, 'dad.js'), ['--silent'], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(!!err);
        done();
      });
    });
  });
});
