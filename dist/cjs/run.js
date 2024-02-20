"use strict";
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
var Queue = require("queue-cb");
var parse = require("string-argv").parseArgsStringToArgv;
var spawn = require("cross-spawn-cb");
module.exports = function run(commands, options, callback) {
    var spawnOptions = _object_spread({
        cwd: process.cwd()
    }, options);
    var results = [];
    var queue = new Queue(options.concurrency || Infinity);
    for(var index = 0; index < commands.length; index++){
        (function(index) {
            queue.defer(function(callback) {
                var command = commands[index];
                var argv = parse(command);
                !options.header || options.header(command);
                spawn(argv[0], argv.slice(1), spawnOptions, function(err, res) {
                    results.push({
                        index: index,
                        command: command,
                        error: err,
                        result: res
                    });
                    callback();
                });
            });
        })(index);
    }
    queue.await(function(err) {
        if (err) return callback(err);
        results = results.sort(function(a, b) {
            return a.index - b.index;
        });
        callback(null, results);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }