"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */
var AutoLoadAdapter = /** @class */ (function () {
    function AutoLoadAdapter() {
    }
    AutoLoadAdapter.prototype.get = function () {
        return Promise.resolve({});
    };
    AutoLoadAdapter.prototype.put = function () {
        return Promise.resolve({});
    };
    return AutoLoadAdapter;
}());
exports.AutoLoadAdapter = AutoLoadAdapter;
//# sourceMappingURL=autoLoadAdapter.js.map