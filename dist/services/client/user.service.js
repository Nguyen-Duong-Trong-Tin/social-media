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
const user_model_1 = __importDefault(require("../../models/user.model"));
const create = (_a) => __awaiter(void 0, [_a], void 0, function* ({ doc }) {
    const newUser = new user_model_1.default(doc);
    return yield newUser.save();
});
const updateOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, update, }) {
    return yield user_model_1.default.updateOne(Object.assign(Object.assign({}, filter), { deleted: false }), update);
});
const countDocuments = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, }) {
    return yield user_model_1.default.countDocuments(Object.assign({ deleted: false }, filter));
});
const find = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, select, sort, skip, limit, }) {
    return yield user_model_1.default.find(Object.assign({ deleted: false }, filter))
        .select(select || "")
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 20);
});
const findOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, select, }) {
    const userExists = yield user_model_1.default.findOne(Object.assign(Object.assign({}, filter), { deleted: false })).select(select || "");
    return userExists;
});
const findOneAndUpdate = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, update, select, }) {
    const userExists = yield user_model_1.default.findOneAndUpdate(Object.assign(Object.assign({}, filter), { deleted: false }), update, { new: true, runValidators: true }).select(select || "");
    return userExists;
});
const userService = {
    create,
    updateOne,
    countDocuments,
    find,
    findOne,
    findOneAndUpdate,
};
exports.default = userService;
