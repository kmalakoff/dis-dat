"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return disDat;
    }
});
require("./polyfills.js");
var _run = /*#__PURE__*/ _interop_require_default(require("./run"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function disDat(commands, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = {};
    }
    options = options || {};
    if (typeof callback === "function") return (0, _run.default)(commands, options, callback);
    return new Promise(function(resolve, reject) {
        (0, _run.default)(commands, options, function runCallback(err, result) {
            err ? reject(err) : resolve(result);
        });
    });
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }