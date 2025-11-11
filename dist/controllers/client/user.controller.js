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
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
// POST /v1/users/check-exists/email
const checkExistsEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const userExists = yield user_service_1.default.findOne({
            filter: { email },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User email not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/users/check-exists/phone
const checkExistsPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        const userExists = yield user_service_1.default.findOne({
            filter: { phone },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User phone not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/users/ids
const findUsersByIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ids } = req.body;
        const users = yield user_service_1.default.find({
            filter: { _id: { $in: ids } },
            select: "-password",
        });
        if (users.length !== ids.length) {
            return res.status(404).json({
                status: false,
                message: "Some user ids not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Users found",
            data: users,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users?sort&page&limit&filter
const findUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { fullName, slug, notInIds } = JSON.parse(filter);
            if (fullName) {
                filterOptions.fullName = new RegExp(fullName, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (notInIds) {
                const ids = JSON.parse(notInIds);
                filterOptions["_id"] = { $nin: ids };
            }
        }
        const [total, items] = yield Promise.all([
            user_service_1.default.countDocuments({ filter: filterOptions }),
            user_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Users found",
            data: {
                users: {
                    total,
                    page: pagination.page,
                    limit: pagination.limit,
                    items,
                },
            },
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/users/slug/:slug
const findUserBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const userExists = yield user_service_1.default.findOne({
            filter: { slug },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "User found",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/users/bio/:id
const updateBio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { bio } = req.body;
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { bio },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: userExists,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const userController = {
    checkExistsEmail,
    checkExistsPhone,
    findUsers,
    findUsersByIds,
    findUserBySlug,
    updateBio,
};
exports.default = userController;
