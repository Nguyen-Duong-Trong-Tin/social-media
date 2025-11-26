"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const message_model_1 = __importDefault(require("../../models/message.model"));
const insertMany = (_a) => __awaiter(void 0, [_a], void 0, function* ({ docs }) {
    return yield message_model_1.default.insertMany(docs);
});
const countDocuments = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, }) {
    return yield message_model_1.default.countDocuments(Object.assign({ deleted: false }, filter));
});
const find = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, sort, skip, limit, }) {
    return yield message_model_1.default.find(Object.assign({ deleted: false }, filter))
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0);
});
const messageService = {
    insertMany,
    countDocuments,
    find,
};
exports.default = messageService;
