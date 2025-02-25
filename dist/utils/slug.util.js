"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slug = require("slug");
const convert = (string) => {
    return slug(string);
};
const slugUtil = {
    convert
};
exports.default = slugUtil;
