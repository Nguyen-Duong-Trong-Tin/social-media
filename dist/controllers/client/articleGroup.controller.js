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
const articleGroup_service_1 = __importDefault(require("../../services/client/articleGroup.service"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const articleGroup_enum_1 = require("../../enums/articleGroup.enum");
// GET /v1/articleGroups?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, status, groupId } = JSON.parse(filter);
            if (title) {
                filterOptions.title = new RegExp(title, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (status) {
                filterOptions.status = status;
            }
            if (groupId) {
                filterOptions.groupId = groupId;
            }
        }
        const [total, items] = yield Promise.all([
            articleGroup_service_1.default.countDocuments({ filter: filterOptions }),
            articleGroup_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Article groups found",
            data: {
                articleGroups: {
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
// GET /v1/articleGroups/:id
const findById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const articleGroupExists = yield articleGroup_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Article group id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Article group found",
            data: articleGroupExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/articleGroups/slug/:slug
const findBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const articleGroupExists = yield articleGroup_service_1.default.findOne({
            filter: { slug },
        });
        if (!articleGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Article group slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Article group found",
            data: articleGroupExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/articleGroups
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { title, description, userId, groupId } = req.body;
        const images = ((_a = req.files) === null || _a === void 0 ? void 0 : _a["images"]) || [];
        const videos = ((_b = req.files) === null || _b === void 0 ? void 0 : _b["videos"]) || [];
        if (!title || !description || !userId || !groupId) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields",
            });
        }
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const [articleGroupSlugExists, groupExists] = yield Promise.all([
            articleGroup_service_1.default.findOne({ filter: { slug } }),
            group_service_1.default.findOne({ filter: { _id: groupId } }),
        ]);
        if (articleGroupSlugExists) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong. Please try again",
            });
        }
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        const isMember = (_c = groupExists.users) === null || _c === void 0 ? void 0 : _c.some((user) => user.userId === userId);
        if (!isMember) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const newArticleGroup = yield articleGroup_service_1.default.create({
            doc: {
                title,
                slug,
                description,
                images: imagePaths,
                videos: videoPaths,
                status: articleGroup_enum_1.EArticleGroupStatus.active,
                groupId,
                createdBy,
                deleted: false,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Article created successfully",
            data: newArticleGroup,
        });
    }
    catch (_d) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/articleGroups/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { title, description, userId, status } = req.body;
        const images = ((_a = req.files) === null || _a === void 0 ? void 0 : _a["images"]) || [];
        const videos = ((_b = req.files) === null || _b === void 0 ? void 0 : _b["videos"]) || [];
        const articleGroupExists = yield articleGroup_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Article group id not found",
            });
        }
        if (!userId || ((_c = articleGroupExists.createdBy) === null || _c === void 0 ? void 0 : _c.userId) !== userId) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        let slug;
        if (title && title !== articleGroupExists.title) {
            slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
            const slugExists = yield articleGroup_service_1.default.findOne({ filter: { slug } });
            if (slugExists) {
                return res.status(500).json({
                    status: false,
                    message: "Something went wrong. Please try again",
                });
            }
        }
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const updatedArticleGroup = yield articleGroup_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: {
                $set: {
                    title: title !== null && title !== void 0 ? title : undefined,
                    slug: slug !== null && slug !== void 0 ? slug : undefined,
                    description: description !== null && description !== void 0 ? description : undefined,
                    images: imagePaths.length ? imagePaths : undefined,
                    videos: videoPaths.length ? videoPaths : undefined,
                    status: status !== null && status !== void 0 ? status : undefined,
                },
            },
        });
        return res.status(200).json({
            status: true,
            message: "Article updated successfully",
            data: updatedArticleGroup,
        });
    }
    catch (_d) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// DELETE /v1/articleGroups/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const articleGroupExists = yield articleGroup_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!articleGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Article group id not found",
            });
        }
        if (!userId || ((_a = articleGroupExists.createdBy) === null || _a === void 0 ? void 0 : _a.userId) !== userId) {
            return res.status(403).json({
                status: false,
                message: "Forbidden",
            });
        }
        const deleted = yield articleGroup_service_1.default.del({ id });
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
const articleGroupController = {
    find,
    findById,
    findBySlug,
    create,
    update,
    del,
};
exports.default = articleGroupController;
