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
const taskGroupSubmission_model_1 = __importDefault(require("../../models/taskGroupSubmission.model"));
const find = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, }) {
    return yield taskGroupSubmission_model_1.default.find(Object.assign({ deleted: false }, filter));
});
const findOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, }) {
    return yield taskGroupSubmission_model_1.default.findOne(Object.assign({ deleted: false }, filter));
});
const findOneAndUpdate = (_a) => __awaiter(void 0, [_a], void 0, function* ({ filter, update, }) {
    return yield taskGroupSubmission_model_1.default.findOneAndUpdate(Object.assign({ deleted: false }, filter), update, {
        new: true,
        runValidators: true,
    });
});
const create = (_a) => __awaiter(void 0, [_a], void 0, function* ({ doc }) {
    const newTaskGroupSubmission = new taskGroupSubmission_model_1.default(doc);
    yield newTaskGroupSubmission.save();
    return newTaskGroupSubmission;
});
const taskGroupSubmissionService = {
    find,
    findOne,
    findOneAndUpdate,
    create,
};
exports.default = taskGroupSubmissionService;
