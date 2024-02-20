"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _exit = /*#__PURE__*/ _interop_require_default(require("exit"));
var _getoptscompat = /*#__PURE__*/ _interop_require_default(require("getopts-compat"));
var _index = /*#__PURE__*/ _interop_require_default(require("./index.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = function(argv, name) {
    var options = (0, _getoptscompat.default)(argv, {
        alias: {
            silent: "s",
            concurrency: "c"
        },
        boolean: [
            "silent"
        ],
        default: {
            concurrency: name === "dtd" ? 1 : Infinity
        },
        stopEarly: true
    });
    var args = options._;
    if (!args.length) {
        console.log("Missing command. Example usage: ".concat(name, " [command]"));
        return (0, _exit.default)(-1);
    }
    if (!options.silent) options.header = function(command) {
        console.log("\n----------------------");
        console.log(command);
        console.log("----------------------");
    };
    options.stdio = "inherit";
    (0, _index.default)(args, options, function(err, results) {
        if (err) {
            console.log(err.message);
            return (0, _exit.default)(err.code || -1);
        }
        var errors = results.filter(function(result) {
            return !!result.error;
        });
        if (!options.silent) {
            console.log("\n======================");
            if (errors.length) {
                console.log("Errors (".concat(errors.length, ")"));
                for(var index = 0; index < errors.length; index++){
                    var result = errors[index];
                    console.log("".concat(result.path, " Error: ").concat(result.error.message));
                }
            } else console.log("Success (".concat(results.length, ")"));
            console.log("======================");
        }
        (0, _exit.default)(errors.length ? -1 : 0);
    });
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }