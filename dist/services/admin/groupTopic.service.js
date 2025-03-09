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
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const groupTopic_model_1 = __importDefault(require("../../models/groupTopic.model"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const findAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const groupTopic = yield groupTopic_model_1.default.find({ deleted: false });
    return groupTopic;
});
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        const slug = slug_util_1.default.convert(req.query.keyword);
        find.slug = new RegExp(slug, "i");
    }
    const sort = (0, sort_helper_1.default)(req);
    const groupTopics = yield groupTopic_model_1.default
        .find(find)
        .select("-password")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    ;
    return groupTopics;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const groupTopicExists = yield groupTopic_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    return groupTopicExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const groupTopicExists = yield groupTopic_model_1.default.findOne({
        slug,
        deleted: false
    });
    return groupTopicExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield groupTopic_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (groupTopic) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroupTopic = new groupTopic_model_1.default(groupTopic);
    yield newGroupTopic.save();
    return newGroupTopic;
});
const update = (id, groupTopic) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroupTopic = yield groupTopic_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, groupTopic, {
        new: true,
        runValidators: true
    });
    return newGroupTopic;
});
const del = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroupTopic = yield groupTopic_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        deleted: true
    }, {
        new: true,
        runValidators: true
    });
    return newGroupTopic;
});
const groupTopicService = {
    findAll,
    find,
    findById,
    findBySlug,
    calculateMaxPage,
    create,
    update,
    del
};
exports.default = groupTopicService;
