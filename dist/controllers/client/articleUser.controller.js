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
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const articleUser_service_1 = __importDefault(require("../../services/client/articleUser.service"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const articleUser_enum_1 = require("../../enums/articleUser.enum");
const parseExistingMedia = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value !== "string")
        return [];
    const trimmed = value.trim();
    if (!trimmed)
        return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean);
            }
        }
        catch (_a) {
            // fall through to delimiter split
        }
    }
    return trimmed
        .split(/[,;|\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
};
const uniqueList = (items) => Array.from(new Set(items));
// GET /v1/articleUsers?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, status, userId } = JSON.parse(filter);
            if (title) {
                filterOptions.title = new RegExp(title, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (status) {
                filterOptions.status = status;
            }
            if (userId) {
                filterOptions["createdBy.userId"] = userId;
            }
        }
        const [total, items] = yield Promise.all([
            articleUser_service_1.default.countDocuments({ filter: filterOptions }),
            articleUser_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Article users found",
            data: {
                articleUsers: {
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
// GET /v1/articleUsers/:id
const findById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const articleUserExists = yield articleUser_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleUserExists) {
            return res.status(404).json({
                status: false,
                message: "Article user id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Article user found",
            data: articleUserExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/articleUsers/slug/:slug
const findBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const articleUserExists = yield articleUser_service_1.default.findOne({
            filter: { slug },
        });
        if (!articleUserExists) {
            return res.status(404).json({
                status: false,
                message: "Article user slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Article user found",
            data: articleUserExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/articleUsers
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, description, userId } = req.body;
        const images = ((_a = req.files) === null || _a === void 0 ? void 0 : _a["images"]) || [];
        const videos = ((_b = req.files) === null || _b === void 0 ? void 0 : _b["videos"]) || [];
        if (!title || !description || !userId) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields",
            });
        }
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const [articleUserSlugExists, userExists] = yield Promise.all([
            articleUser_service_1.default.findOne({ filter: { slug } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
        ]);
        if (articleUserSlugExists) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong. Please try again",
            });
        }
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const newArticleUser = yield articleUser_service_1.default.create({
            doc: {
                title,
                slug,
                description,
                images: imagePaths,
                videos: videoPaths,
                status: articleUser_enum_1.EArticleUserStatus.active,
                createdBy,
                deleted: false,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Article created successfully",
            data: newArticleUser,
        });
    }
    catch (_c) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/articleUsers/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, description, userId, status, existingImages, existingVideos } = req.body;
        const images = ((_a = req.files) === null || _a === void 0 ? void 0 : _a["images"]) || [];
        const videos = ((_b = req.files) === null || _b === void 0 ? void 0 : _b["videos"]) || [];
        const articleUserExists = yield articleUser_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleUserExists) {
            return res.status(404).json({
                status: false,
                message: "Article user id not found",
            });
        }
        if (!userId || ((_c = articleUserExists.createdBy) === null || _c === void 0 ? void 0 : _c.userId) !== userId) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        let slug;
        if (title && title !== articleUserExists.title) {
            slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
            const slugExists = yield articleUser_service_1.default.findOne({ filter: { slug } });
            if (slugExists) {
                return res.status(500).json({
                    status: false,
                    message: "Something went wrong. Please try again",
                });
            }
        }
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const mergedImages = uniqueList([
            ...parseExistingMedia(existingImages),
            ...imagePaths,
        ]);
        const mergedVideos = uniqueList([
            ...parseExistingMedia(existingVideos),
            ...videoPaths,
        ]);
        const updatedArticleUser = yield articleUser_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: {
                $set: {
                    title: title !== null && title !== void 0 ? title : undefined,
                    slug: slug !== null && slug !== void 0 ? slug : undefined,
                    description: description !== null && description !== void 0 ? description : undefined,
                    images: mergedImages.length ? mergedImages : undefined,
                    videos: mergedVideos.length ? mergedVideos : undefined,
                    status: status !== null && status !== void 0 ? status : undefined,
                },
            },
        });
        return res.status(200).json({
            status: true,
            message: "Article updated successfully",
            data: updatedArticleUser,
        });
    }
    catch (_d) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// DELETE /v1/articleUsers/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const articleUserExists = yield articleUser_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleUserExists) {
            return res.status(404).json({
                status: false,
                message: "Article user id not found",
            });
        }
        if (!userId || ((_a = articleUserExists.createdBy) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        const deleted = yield articleUser_service_1.default.del({ id });
        return res.status(200).json({
            status: true,
            message: "Article deleted successfully",
            data: deleted,
        });
    }
    catch (_b) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const articleUserController = {
    find,
    findById,
    findBySlug,
    create,
    update,
    del,
};
exports.default = articleUserController;
