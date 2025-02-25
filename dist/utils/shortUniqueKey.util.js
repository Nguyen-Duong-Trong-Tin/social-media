"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const generate = () => {
    const uid = new short_unique_id_1.default({ length: 20 });
    return uid.rnd();
};
const shortUniqueKeyUtil = {
    generate
};
exports.default = shortUniqueKeyUtil;
