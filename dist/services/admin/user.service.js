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
const filter_helper_1 = __importDefault(require("../../helpers/filter.helper"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const user_model_1 = __importDefault(require("../../models/user.model"));
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
    const users = yield user_model_1.default
        .find(Object.assign(Object.assign({}, find), filter))
        .select("-password")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    ;
    return users;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield user_model_1.default
        .findOne({
        _id: id,
        deleted: false
    })
        .select("-password");
    return userExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield user_model_1.default
        .findOne({
        slug,
        deleted: false
    })
        .select("-password");
    return userExists;
});
const findByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield user_model_1.default
        .findOne({
        email,
        deleted: false
    })
        .select("-password");
    return userExists;
});
const findByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield user_model_1.default
        .findOne({
        phone,
        deleted: false
    })
        .select("-password");
    return userExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield user_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new user_model_1.default(user);
    yield newUser.save();
    const userExists = yield user_model_1.default
        .findOne({ _id: newUser.id })
        .select("-password");
    return userExists;
});
const update = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield user_model_1.default
        .findOneAndUpdate({
        _id: id,
        deleted: false
    }, user, {
        new: true,
        runValidators: true
    })
        .select("-password");
    return newUser;
});
const del = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield user_model_1.default
        .findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        deleted: true
    }, {
        new: true,
        runValidators: true
    })
        .select("-password");
    return newUser;
});
const userService = {
    find,
    findById,
    findBySlug,
    findByEmail,
    findByPhone,
    calculateMaxPage,
    create,
    update,
    del
};
exports.default = userService;
