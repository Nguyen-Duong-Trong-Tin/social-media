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
const groupTopic_model_1 = __importDefault(require("../../models/groupTopic.model"));
const countDocuments = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, }) {
    return yield groupTopic_model_1.default.countDocuments(Object.assign({ deleted: false }, filter));
});
const find = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, select, sort, skip, limit, }) {
    return yield groupTopic_model_1.default.find(Object.assign({ deleted: false }, filter))
        .select(select || "")
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 20);
});
const findOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, select, }) {
    return yield groupTopic_model_1.default.findOne(Object.assign({ deleted: false }, filter)).select(select || "");
});
const groupTopicService = {
    countDocuments,
    find,
    findOne,
};
exports.default = groupTopicService;
