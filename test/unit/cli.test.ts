import assert from 'assert';
import cr from 'cr';
import spawn from 'cross-spawn-cb';
import isVersion from 'is-version';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const BIN = path.join(__dirname, '..', '..', 'bin');
const CLI_DTD = path.join(BIN, 'dtd.js');
const CLI_DAD = path.join(BIN, 'dad.js');

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const NODE = isWindows ? 'node.exe' : 'node';
const res = spawn.sync(NODE, ['--version'], { encoding: 'utf8' });
const VERSION = cr(res.stdout).split('\n')[0];

describe('cli', () => {
  describe('version', () => {
    it('--version flag - dad', (done) => {
      spawn(CLI_DAD, ['--version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const version = cr(res.stdout).split('\n')[0].trim();
        assert.ok(isVersion(version), `Expected valid semver version, got: ${version}`);
        done();
      });
    });

    it('--version flag - dtd', (done) => {
      spawn(CLI_DTD, ['--version'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const version = cr(res.stdout).split('\n')[0].trim();
        assert.ok(isVersion(version), `Expected valid semver version, got: ${version}`);
        done();
      });
    });

    it('-v flag - dad', (done) => {
      spawn(CLI_DAD, ['-v'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const version = cr(res.stdout).split('\n')[0].trim();
        assert.ok(isVersion(version), `Expected valid semver version, got: ${version}`);
        done();
      });
    });

    it('-v flag - dtd', (done) => {
      spawn(CLI_DTD, ['-v'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const version = cr(res.stdout).split('\n')[0].trim();
        assert.ok(isVersion(version), `Expected valid semver version, got: ${version}`);
        done();
      });
    });
  });

  describe('help', () => {
    it('--help flag - dad', (done) => {
      spawn(CLI_DAD, ['--help'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const output = res.stdout;
        assert.ok(output.indexOf('dad') >= 0, 'Should contain command name');
        assert.ok(output.indexOf('Usage:') >= 0, 'Should contain usage section');
        assert.ok(output.indexOf('Options:') >= 0, 'Should contain options section');
        assert.ok(output.indexOf('--version') >= 0, 'Should document --version flag');
        assert.ok(output.indexOf('--help') >= 0, 'Should document --help flag');
        assert.ok(output.indexOf('parallel') >= 0, 'Should mention parallel execution');
        done();
      });
    });

    it('--help flag - dtd', (done) => {
      spawn(CLI_DTD, ['--help'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        const output = res.stdout;
        assert.ok(output.indexOf('dtd') >= 0, 'Should contain command name');
        assert.ok(output.indexOf('Usage:') >= 0, 'Should contain usage section');
        assert.ok(output.indexOf('Options:') >= 0, 'Should contain options section');
        assert.ok(output.indexOf('--version') >= 0, 'Should document --version flag');
        assert.ok(output.indexOf('--help') >= 0, 'Should document --help flag');
        assert.ok(output.indexOf('sequentially') >= 0, 'Should mention sequential execution');
        done();
      });
    });

    it('-h flag - dad', (done) => {
      spawn(CLI_DAD, ['-h'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        assert.ok(res.stdout.indexOf('Usage:') >= 0, 'Should contain usage section');
        done();
      });
    });

    it('-h flag - dtd', (done) => {
      spawn(CLI_DTD, ['-h'], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        assert.ok(res.stdout.indexOf('Usage:') >= 0, 'Should contain usage section');
        done();
      });
    });
  });

  describe('happy path', () => {
    it('basic command - sequential', (done) => {
      spawn(CLI_DTD, ['--silent', '--streaming', '--expanded', 'echo "hello"', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });

    it('basic command - parallel', (done) => {
      spawn(CLI_DAD, ['--silent', '--streaming', '--expanded', 'echo "hello"', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        if (err) {
          done(err.message);
          return;
        }
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - stops in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', '--streaming', '--expanded', 'echo "hello"', 'this is an error', `${NODE} --version`], { encoding: 'utf8' }, (err) => {
        assert.ok(err.status !== 0);
        assert.ok(err.stdout.indexOf('hello') >= 0);
        assert.ok(err.stdout.indexOf(VERSION) < 0);
        done();
      });
    });
    it('handles errors - suppresses in dtd', (done) => {
      spawn(CLI_DTD, ['--silent', '--streaming', '--expanded', 'echo "hello"', '{this is an error}', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
        assert.ok(!err);
        assert.ok(res.stdout.indexOf('hello') >= 0);
        assert.ok(res.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - stops in dad', (done) => {
      spawn(CLI_DAD, ['--silent', '--streaming', '--expanded', 'echo "hello"', 'this is an error', `${NODE} --version`], { encoding: 'utf8' }, (err) => {
        assert.ok(err.status !== 0);
        assert.ok(err.stdout.indexOf('hello') >= 0);
        assert.ok(err.stdout.indexOf(VERSION) >= 0);
        done();
      });
    });
    it('handles errors - suppresses in dad', (done) => {
      spawn(CLI_DAD, ['--silent', '--streaming', '--expanded', 'echo "hello"', '{this is an error}', `${NODE} --version`], { encoding: 'utf8' }, (err, res) => {
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
