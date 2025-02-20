"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const md5 = require("md5");
const encode = (string) => {
    return md5(string);
};
const md5Util = {
    encode
};
exports.default = md5Util;
