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
const group_model_1 = __importDefault(require("../../models/group.model"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const group_enum_1 = require("../../enums/group.enum");
const findAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield group_model_1.default.find({ deleted: false });
    return groups;
});
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        const slug = slug_util_1.default.convert(req.query.keyword);
        find.slug = new RegExp(slug, "i");
    }
    const filter = (0, filter_helper_1.default)(req);
    const sort = (0, sort_helper_1.default)(req);
    const groups = yield group_model_1.default
        .find(Object.assign(Object.assign({}, find), filter))
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    return groups;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const groupExists = yield group_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    return groupExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const groupExists = yield group_model_1.default.findOne({
        slug,
        deleted: false
    });
    return groupExists;
});
const findUserInGroup = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const groupUserExists = yield group_model_1.default.findOne({
        _id: id,
        "users.userId": userId,
        deleted: false
    });
    return groupUserExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield group_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (group) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = new group_model_1.default(group);
    yield newGroup.save();
    return newGroup;
});
const update = (id, group) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, group, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const changeUserRole = (id, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        "users.userId": userId,
        deleted: false
    }, {
        $set: {
            "users.$.role": role
        }
    }, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const acceptUser = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        $push: {
            users: {
                userId,
                role: group_enum_1.EGroupRole.user
            }
        }
    }, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const delUser = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, { $pull: { users: { userId } } }, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const delUserRequest = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, { $pull: { userRequests: userId } }, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const del = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const newGroup = yield group_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        deleted: true
    }, {
        new: true,
        runValidators: true
    });
    return newGroup;
});
const groupService = {
    findAll,
    find,
    findById,
    findBySlug,
    findUserInGroup,
    calculateMaxPage,
    create,
    update,
    changeUserRole,
    acceptUser,
    delUser,
    delUserRequest,
    del
};
exports.default = groupService;
