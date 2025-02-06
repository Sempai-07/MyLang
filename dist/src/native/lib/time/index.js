"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = Time;
exports.now = now;
exports.parse = parse;
exports.UTC = UTC;
const BaseError_1 = require("../../../errors/BaseError");
function Time(args) {
    const now = new Date(...args);
    function validateNumber(value, name) {
        if (typeof value !== "number" || isNaN(value)) {
            throw new BaseError_1.ArgumentsError(`${name} must be a valid number.`, [
                `mylang:time (${__filename})`,
            ]);
        }
    }
    function createFromDate(...date) {
        return Time(date);
    }
    return {
        toString: () => now.toString(),
        toDateString: () => now.toDateString(),
        toTimeString: () => now.toTimeString(),
        toISOString: () => now.toISOString(),
        toUTCString: () => now.toUTCString(),
        getDate: () => now.getDate(),
        setDate: ([day]) => {
            validateNumber(day, "day");
            const newTime = new Date(now);
            newTime.setDate(day);
            return createFromDate(newTime);
        },
        getDay: () => now.getDay(),
        getFullYear: () => now.getFullYear(),
        setFullYear: ([year, month = now.getMonth(), day = now.getDate()]) => {
            validateNumber(year, "year");
            const newTime = new Date(now);
            newTime.setFullYear(year, month, day);
            return createFromDate(newTime);
        },
        getHours: () => now.getHours(),
        setHours: ([hours, minutes = now.getMinutes(), seconds = now.getSeconds(), ms = now.getMilliseconds(),]) => {
            validateNumber(hours, "hours");
            const newTime = new Date(now);
            newTime.setHours(hours, minutes, seconds, ms);
            return createFromDate(newTime);
        },
        getMilliseconds: () => now.getMilliseconds(),
        setMilliseconds: ([ms]) => {
            validateNumber(ms, "milliseconds");
            const newTime = new Date(now);
            newTime.setMilliseconds(ms);
            return createFromDate(newTime);
        },
        getMinutes: () => now.getMinutes(),
        setMinutes: ([minutes, seconds = now.getSeconds(), ms = now.getMilliseconds(),]) => {
            validateNumber(minutes, "minutes");
            const newTime = new Date(now);
            newTime.setMinutes(minutes, seconds, ms);
            return createFromDate(newTime);
        },
        getMonth: () => now.getMonth(),
        setMonth: ([month, day = now.getDate()]) => {
            validateNumber(month, "month");
            const newTime = new Date(now);
            newTime.setMonth(month, day);
            return createFromDate(newTime);
        },
        getSeconds: () => now.getSeconds(),
        setSeconds: ([seconds, ms = now.getMilliseconds()]) => {
            validateNumber(seconds, "seconds");
            const newTime = new Date(now);
            newTime.setSeconds(seconds, ms);
            return createFromDate(newTime);
        },
        getTime: () => now.getTime(),
        setTime: ([time]) => {
            validateNumber(time, "time");
            const newTime = new Date(time);
            return createFromDate(newTime);
        },
        getTimezoneOffset: () => now.getTimezoneOffset(),
        getUTCDate: () => now.getUTCDate(),
        setUTCDate: ([day]) => {
            validateNumber(day, "UTC date");
            const newTime = new Date(now);
            newTime.setUTCDate(day);
            return createFromDate(newTime);
        },
        getUTCDay: () => now.getUTCDay(),
        getUTCFullYear: () => now.getUTCFullYear(),
        setUTCFullYear: ([year, month = now.getUTCMonth(), day = now.getUTCDate(),]) => {
            validateNumber(year, "UTC full year");
            const newTime = new Date(now);
            newTime.setUTCFullYear(year, month, day);
            return createFromDate(newTime);
        },
        getUTCHours: () => now.getUTCHours(),
        setUTCHours: ([hours, minutes = now.getUTCMinutes(), seconds = now.getUTCSeconds(), ms = now.getUTCMilliseconds(),]) => {
            validateNumber(hours, "UTC hours");
            const newTime = new Date(now);
            newTime.setUTCHours(hours, minutes, seconds, ms);
            return createFromDate(newTime);
        },
        getUTCMilliseconds: () => now.getUTCMilliseconds(),
        setUTCMilliseconds: ([ms]) => {
            validateNumber(ms, "UTC milliseconds");
            const newTime = new Date(now);
            newTime.setUTCMilliseconds(ms);
            return createFromDate(newTime);
        },
        getUTCMinutes: () => now.getUTCMinutes(),
        setUTCMinutes: ([minutes, seconds = now.getUTCSeconds(), ms = now.getUTCMilliseconds(),]) => {
            validateNumber(minutes, "UTC minutes");
            const newTime = new Date(now);
            newTime.setUTCMinutes(minutes, seconds, ms);
            return createFromDate(newTime);
        },
        getUTCMonth: () => now.getUTCMonth(),
        setUTCMonth: ([month, day = now.getUTCDate()]) => {
            validateNumber(month, "UTC month");
            const newTime = new Date(now);
            newTime.setUTCMonth(month, day);
            return createFromDate(newTime);
        },
        getUTCSeconds: () => now.getUTCSeconds(),
        setUTCSeconds: ([seconds, ms = now.getUTCMilliseconds()]) => {
            validateNumber(seconds, "UTC seconds");
            const newTime = new Date(now);
            newTime.setUTCSeconds(seconds, ms);
            return createFromDate(newTime);
        },
        valueOf: () => now.valueOf(),
        toJSON: () => now.toJSON(),
        clone: () => createFromDate(new Date(now)),
    };
}
function now() {
    return Date.now();
}
function parse([dateString]) {
    return Date.parse(dateString);
}
function UTC(args) {
    return Date.UTC(args);
}
