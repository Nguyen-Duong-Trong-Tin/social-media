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
const role_model_1 = __importDefault(require("../../models/role.model"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const findAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_model_1.default.find({ deleted: false });
    return roles;
});
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        const slug = slug_util_1.default.convert(req.query.keyword);
        find.slug = new RegExp(slug, "i");
    }
    const sort = (0, sort_helper_1.default)(req);
    const roles = yield role_model_1.default
        .find(find)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    return roles;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const roleExists = yield role_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    return roleExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const roleExists = yield role_model_1.default.findOne({
        slug,
        deleted: false
    });
    return roleExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield role_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (role) => __awaiter(void 0, void 0, void 0, function* () {
    const newRole = new role_model_1.default(role);
    yield newRole.save();
    return newRole;
});
const update = (id, role) => __awaiter(void 0, void 0, void 0, function* () {
    const newRole = yield role_model_1.default.updateOne({
        _id: id,
        deleted: false
    }, role, {
        new: true,
        runValidators: true
    });
    return newRole;
});
const del = (id, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const newRole = yield role_model_1.default.updateOne({
        _id: id,
        deleted: false
    }, {
        deleted: true,
        deletedBy
    }, {
        new: true,
        runValidators: true
    });
    return newRole;
});
const roleService = {
    findAll,
    find,
    findById,
    findBySlug,
    calculateMaxPage,
    create,
    update,
    del
};
exports.default = roleService;
