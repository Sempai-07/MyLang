"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = exports.Timeout = void 0;
const timeout_1 = require("./timeout");
const interval_1 = require("./interval");
const Timeout = (0, timeout_1.Timeout)();
exports.Timeout = Timeout;
const Interval = (0, interval_1.Interval)();
exports.Interval = Interval;
