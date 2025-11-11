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
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const filter_helper_1 = __importDefault(require("../../helpers/filter.helper"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const taskGroupSubmission_model_1 = __importDefault(require("../../models/taskGroupSubmission.model"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        const slug = slug_util_1.default.convert(req.query.keyword);
        find.slug = new RegExp(slug, "i");
    }
    const filter = (0, filter_helper_1.default)(req);
    const sort = (0, sort_helper_1.default)(req);
    const taskGroupSubmissions = yield taskGroupSubmission_model_1.default.find(Object.assign(Object.assign({}, find), filter))
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    return taskGroupSubmissions;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const taskGroupSubmissionExists = yield taskGroupSubmission_model_1.default.findOne({
        _id: id,
        deleted: false,
    });
    return taskGroupSubmissionExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const taskGroupSubmissionExists = yield taskGroupSubmission_model_1.default.findOne({
        slug,
        deleted: false,
    });
    return taskGroupSubmissionExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield taskGroupSubmission_model_1.default.countDocuments({
        deleted: false,
    });
    return Math.ceil(quantity / limit);
});
const create = (taskGroupSubmissionn) => __awaiter(void 0, void 0, void 0, function* () {
    const newtaskGroupSubmission = new taskGroupSubmission_model_1.default(taskGroupSubmissionn);
    yield newtaskGroupSubmission.save();
    return newtaskGroupSubmission;
});
const update = (id, taskGroupSubmission) => __awaiter(void 0, void 0, void 0, function* () {
    const newTaskGroupSubmission = yield taskGroupSubmission_model_1.default.findByIdAndUpdate({
        _id: id,
        deleted: false,
    }, taskGroupSubmission, {
        new: true,
        runValidators: true,
    });
    return newTaskGroupSubmission;
});
const del = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const newTaskGroupSubmission = yield taskGroupSubmission_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false,
    }, {
        deleted: true,
    }, {
        new: true,
        runValidators: true,
    });
    return newTaskGroupSubmission;
});
const taskGroupSubmissionService = {
    find,
    findById,
    findBySlug,
    calculateMaxPage,
    create,
    update,
    del
};
exports.default = taskGroupSubmissionService;
