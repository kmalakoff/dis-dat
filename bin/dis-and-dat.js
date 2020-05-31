#!/usr/bin/env node

var getopts = require('getopts-compat');

(function () {
  var options = getopts(process.argv.slice(2), {
    alias: { silent: 's', concurrency: 'c' },
    boolean: ['silent'],
    default: { concurrency: Infinity },
    stopEarly: true,
  });

  var args = options._;
  if (!args.length) {
    console.log('Missing command. Example usage: dis-then-dat [command]');
    return process.exit(-1);
  }
  var disDat = require('..');

  if (!options.silent)
    options.header = function (command) {
      console.log('\n----------------------');
      console.log(command);
      console.log('----------------------');
    };

  disDat(args, options, function (err, results) {
    if (err) {
      console.log(err.message);
      return process.exit(err.code || -1);
    }
    var errors = [];
    for (var index = 0; index < results.length; index++) {
      var result = results[index];
      if (result.error || result.result.code !== 0) errors.push(results[index]);
    }

    if (!options.silent) {
      console.log('\n======================');
      if (errors.length) {
        console.log('Errors (' + errors.length + ')');
        // eslint-disable-next-line no-redeclare
        for (var index = 0; index < errors.length; index++) {
          // eslint-disable-next-line no-redeclare
          var result = errors[index];
          if (result.error) console.log(result.path + ' Error: ' + result.error.message);
          else console.log(result.path + ' Exit Code: ' + result.result.code);
        }
      } else console.log('Success (' + results.length + ')');
      console.log('======================');
    }

    process.exit(errors.length ? -1 : 0);
  });
})();
