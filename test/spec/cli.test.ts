import assert from 'assert';
import path from 'path';
import url from 'url';
import cr from 'cr';
import spawn from 'cross-spawn-cb';
import isVersion from 'is-version';
import getLines from '../lib/getLines.cjs';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const BIN = path.join(__dirname, '..', '..', 'bin');
const CLI_DTD = path.join(BIN, 'dtd.cjs');
const CLI_DAD = path.join(BIN, 'dad.cjs');

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const NODE = isWindows ? 'node.exe' : 'node';
const res = spawn.sync(NODE, ['--version'], { encoding: 'utf8' });
const VERSION = cr(res.stdout).split('\n')[0];

describe('cli', () => {
  describe('happy path', () => {
    it('basic command - sequential', (done) => {
      spawn(CLI_DTD, ['--silent', '--expanded', 'echo "hello"', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err.message);
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });

    it('basic command - parallel', (done) => {
      spawn(CLI_DAD, ['--silent', '--expanded', 'echo "hello"', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        if (err) return done(err.message);
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - stops in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', '--expanded', 'echo "hello"', 'this is an error', `${NODE} --version`], { encoding: 'utf8' }, (err) => {
        assert.ok(err.status !== 0);
        assert.ok(err.stdout.indexOf('hello') >= 0);
        assert.ok(err.stdout.indexOf(VERSION) < 0);
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', '--expanded', 'echo "hello"', '{this is an error}', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - stops in dad', (done) => {
      spawn(CLI_DAD, ['--silent', '--expanded', 'echo "hello"', 'this is an error', `${NODE} --version`], { encoding: 'utf8' }, (err, _res) => {
        assert.ok(err.status !== 0);
        assert.ok(err.stdout.indexOf('hello') >= 0);
        assert.ok(err.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      spawn(CLI_DAD, ['--silent', '--expanded', 'echo "hello"', '{this is an error}', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
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
