#!/usr/bin/env node

var getopts = require('getopts-compat');
var exit = require('exit');
var disDat = require('..');

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
    return exit(-1);
  }

  if (!options.silent)
    options.header = function (command) {
      console.log('\n----------------------');
      console.log(command);
      console.log('----------------------');
    };

  disDat(args, options, function (err, results) {
    if (err) {
      console.log(err.message);
      return exit(err.code || -1);
    }
    var errors = results.filter(function (result) {
      return !!result.error;
    });

    if (!options.silent) {
      console.log('\n======================');
      if (errors.length) {
        console.log('Errors (' + errors.length + ')');
        for (var index = 0; index < errors.length; index++) {
          var result = errors[index];
          console.log(result.path + ' Error: ' + result.error.message);
        }
      } else console.log('Success (' + results.length + ')');
      console.log('======================');
    }

    exit(errors.length ? -1 : 0);
  });
})();
