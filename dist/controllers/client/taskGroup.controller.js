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
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const taskGroup_service_1 = __importDefault(require("../../services/client/taskGroup.service"));
const taskGroupSubmission_service_1 = __importDefault(require("../../services/client/taskGroupSubmission.service"));
// POST /v1/taskGroups
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const deadline = new Date(req.body.deadline);
        const [taskGroupSlugExists, userExists, groupExists] = yield Promise.all([
            taskGroup_service_1.default.findOne({ filter: { slug } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
            group_service_1.default.findOne({ filter: { _id: groupId } }),
        ]);
        if (taskGroupSlugExists) {
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
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const newTaskGroup = yield taskGroup_service_1.default.create({
            doc: {
                title,
                slug,
                description,
                images: imagePaths,
                videos: videoPaths,
                status,
                groupId,
                createdBy,
                deadline,
                deleted: false,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Task group created successfully",
            data: newTaskGroup,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/taskGroups/:id
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const status = req.body.status;
        const userId = req.body.userId;
        const groupId = req.body.groupId;
        const deadline = new Date(req.body.deadline);
        const imagesRemoved = JSON.parse(req.body.imagesRemoved);
        const videosRemoved = JSON.parse(req.body.videosRemoved);
        const [taskGroupExists, taskGroupSlugExists, userExists, groupExists] = yield Promise.all([
            taskGroup_service_1.default.findOne({ filter: { _id: id } }),
            taskGroup_service_1.default.findOne({ filter: { slug } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
            group_service_1.default.findOne({ filter: { _id: groupId } }),
        ]);
        if (!taskGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Task group id not found",
            });
        }
        if (title && taskGroupSlugExists) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong. Please try again",
            });
        }
        if (userId && !userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        if (groupId && !groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        let newTaskGroup = yield taskGroup_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: {
                $pull: {
                    images: { $in: imagesRemoved },
                    videos: { $in: videosRemoved },
                },
                // $push: {
                //   images: { $each: imagePaths  },
                //   videos: { $each: videoPaths },
                //   materials: { $each: materialPaths },
                // },
                $set: {
                    title,
                    slug: title ? slug : undefined,
                    description,
                    status,
                    groupId,
                    createdBy: userId ? createdBy : undefined,
                    deadline,
                },
            },
        });
        newTaskGroup = yield taskGroup_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: {
                $push: {
                    images: { $each: imagePaths },
                    videos: { $each: videoPaths },
                },
            },
        });
        return res.status(200).json({
            status: true,
            message: "Task group updated successfully",
            data: newTaskGroup,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// DELETE /v1/taskGroups/:id
const del = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const taskGroupExists = yield taskGroup_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { deleted: true },
        });
        if (!taskGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Task group id not found",
            });
        }
        yield taskGroupSubmission_service_1.default.updateMany({
            filter: { taskGroupId: id },
            update: { deleted: true },
        });
        return res.status(200).json({
            status: true,
            message: "Task group deleted successfully",
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Seomthing went wrong",
        });
    }
});
// GET /v1/taskGroups?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, description, status, groupId } = JSON.parse(filter);
            if (title) {
                filterOptions.title = new RegExp(title, "i");
            }
            if (slug) {
                filterOptions.slug = new RegExp(slug, "i");
            }
            if (description) {
                filterOptions.description = new RegExp(description, "i");
            }
            if (status) {
                filterOptions.status = status;
            }
            if (groupId) {
                filterOptions.groupId = groupId;
            }
        }
        const [total, items] = yield Promise.all([
            taskGroup_service_1.default.countDocuments({ filter: filterOptions }),
            taskGroup_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Task groups found",
            data: {
                taskGroups: {
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
// GET /v1/taskGroups/:id
const findById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const taskGroupExists = yield taskGroup_service_1.default.findOne({
            filter: { _id: id },
        });
        if (!taskGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Task group id not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Task group found",
            data: taskGroupExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const taskGroupController = {
    create,
    update,
    del,
    find,
    findById,
};
exports.default = taskGroupController;
