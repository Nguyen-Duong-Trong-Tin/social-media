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
const account_model_1 = __importDefault(require("../../models/account.model"));
const filter_helper_1 = __importDefault(require("../../helpers/filter.helper"));
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        find.email = new RegExp(req.query.keyword, "i");
    }
    const filter = (0, filter_helper_1.default)(req);
    const sort = (0, sort_helper_1.default)(req);
    const accounts = yield account_model_1.default
        .find(Object.assign(Object.assign({}, find), filter))
        .select("-password")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    ;
    return accounts;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const accountExists = yield account_model_1.default
        .findOne({
        _id: id,
        deleted: false
    })
        .select("-password");
    return accountExists;
});
const findByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const accountExists = yield account_model_1.default
        .findOne({
        email,
        deleted: false
    })
        .select("-password");
    return accountExists;
});
const findByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const accountExists = yield account_model_1.default
        .findOne({
        phone,
        deleted: false
    })
        .select("-password");
    return accountExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield account_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (account) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccount = new account_model_1.default(account);
    yield newAccount.save();
    const accountExists = yield account_model_1.default
        .findOne({ _id: newAccount.id })
        .select("-password");
    return accountExists;
});
const update = (id, account) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccount = yield account_model_1.default
        .updateOne({
        _id: id,
        deleted: false
    }, account, {
        new: true,
        runValidators: true
    })
        .select("-password");
    return newAccount;
});
const del = (id, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccount = yield account_model_1.default.updateOne({
        _id: id,
        deleted: false
    }, {
        deleted: true,
        deletedBy
    }, {
        new: true,
        runValidators: true
    });
    return newAccount;
});
const accountService = {
    find,
    findById,
    findByEmail,
    findByPhone,
    calculateMaxPage,
    create,
    update,
    del
};
exports.default = accountService;
