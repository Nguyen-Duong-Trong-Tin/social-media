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
const sendMail_helper_1 = __importDefault(require("../../helpers/sendMail.helper"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const taskGroup_service_1 = __importDefault(require("../../services/client/taskGroup.service"));
const taskGroupSubmission_service_1 = __importDefault(require("../../services/client/taskGroupSubmission.service"));
// GET /v1/groups?sort&page&limit&filter
const find = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const sort = (0, sort_helper_1.default)(req);
        const pagination = (0, pagination_helper_1.default)(req);
        const filterOptions = {};
        if (filter) {
            const { title, slug, description, status, taskGroupId } = JSON.parse(filter);
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
            if (taskGroupId) {
                filterOptions.taskGroupId = taskGroupId;
            }
        }
        const [total, items] = yield Promise.all([
            taskGroupSubmission_service_1.default.countDocuments({ filter: filterOptions }),
            taskGroupSubmission_service_1.default.find({
                filter: filterOptions,
                skip: pagination.skip,
                limit: pagination.limit,
                sort,
            }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Task group submissions found",
            data: {
                taskGroupSubmissions: {
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
// GET /v1/groups/slug/:slug
const findBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findOne({
            filter: { slug },
        });
        if (!taskGroupSubmissionExists) {
            return res.status(404).json({
                status: false,
                message: "Task group submission slug not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Task group submission exists",
            data: taskGroupSubmissionExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// POST /v1/taskGroupSubmissions/find-by-user-id-and-task-group-ids
const findByUserIdAndTaskGroupIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, taskGroupIds } = req.body;
        const taskGroupSubmissions = yield taskGroupSubmission_service_1.default.find({
            filter: {
                "createdBy.userId": userId,
                taskGroupId: { $in: taskGroupIds },
            },
        });
        const map = new Map();
        for (const s of taskGroupSubmissions) {
            map.set(String(s.taskGroupId), s);
        }
        const ordered = taskGroupIds.map((id) => { var _a; return (_a = map.get(String(id))) !== null && _a !== void 0 ? _a : null; });
        return res.status(200).json({
            status: true,
            message: "Task group submissions found",
            data: {
                taskGroupSubmissions: ordered,
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
// POST /v1/taskGroupSubmissions/submit
const submit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const title = req.body.title;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const description = req.body.description;
        const images = req.files["images"];
        const videos = req.files["videos"];
        const materials = req.files["materials"];
        const status = req.body.status;
        const userId = req.body.userId;
        const taskGroupId = req.body.taskGroupId;
        const imagesRemoved = JSON.parse(req.body.imagesRemoved);
        const videosRemoved = JSON.parse(req.body.videosRemoved);
        const materialsRemoved = JSON.parse(req.body.materialsRemoved);
        const [taskGroupSubmissionSlugExists, userExists, taskGroupExists] = yield Promise.all([
            taskGroupSubmission_service_1.default.findOne({ filter: { slug } }),
            user_service_1.default.findOne({ filter: { _id: userId } }),
            taskGroup_service_1.default.findOne({ filter: { _id: taskGroupId } }),
        ]);
        if (taskGroupSubmissionSlugExists) {
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
        if (!taskGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Task group id not found",
            });
        }
        const createdBy = {
            userId,
            createdAt: new Date(),
        };
        const imagePaths = (images || []).map((image) => image.path);
        const videoPaths = (videos || []).map((video) => video.path);
        const materialPaths = (materials || []).map((material) => material.path);
        let taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findOneAndUpdate({
            filter: { "createdBy.userId": userId, taskGroupId },
            update: {
                $pull: {
                    images: { $in: imagesRemoved },
                    videos: { $in: videosRemoved },
                    materials: { $in: materialsRemoved },
                },
                // $push: {
                //   images: { $each: imagePaths  },
                //   videos: { $each: videoPaths },
                //   materials: { $each: materialPaths },
                // },
                $set: {
                    title,
                    description,
                    slug,
                },
            },
        });
        if (!taskGroupSubmissionExists) {
            const newTaskGroupSubmission = yield taskGroupSubmission_service_1.default.create({
                doc: {
                    title,
                    slug,
                    description,
                    images: imagePaths,
                    videos: videoPaths,
                    materials: materialPaths,
                    status,
                    taskGroupId,
                    createdBy,
                    deleted: false,
                },
            });
            return res.status(201).json({
                status: true,
                message: "Task group submission created successfully",
                data: newTaskGroupSubmission,
            });
        }
        taskGroupSubmissionExists =
            yield taskGroupSubmission_service_1.default.findOneAndUpdate({
                filter: { "createdBy.userId": userId, taskGroupId },
                update: {
                    $push: {
                        images: { $each: imagePaths },
                        videos: { $each: videoPaths },
                        materials: { $each: materialPaths },
                    },
                },
            });
        return res.status(201).json({
            status: true,
            message: "Task group submission submited successfully",
            data: taskGroupSubmissionExists,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// PATCH /v1/taskGroupSubmissions/scoring/:id
const scoring = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { score, comment, scoredBy, scoredAt } = req.body;
        const taskGroupSubmissionExists = yield taskGroupSubmission_service_1.default.findOneAndUpdate({
            filter: { _id: id },
            update: { score, comment, scoredBy, scoredAt },
            options: { timestamps: false },
        });
        if (!taskGroupSubmissionExists) {
            return res.status(404).json({
                status: false,
                message: "Task group submission id not found",
            });
        }
        const userId = yield taskGroupSubmissionExists.createdBy.userId;
        const userExists = yield user_service_1.default.findOne({
            filter: { _id: userId },
            select: "-password",
        });
        if (!userExists) {
            return res.status(404).json({
                status: false,
                message: "User id not found",
            });
        }
        const taskGroupId = taskGroupSubmissionExists.taskGroupId;
        const taskGroupExists = yield taskGroup_service_1.default.findOne({
            filter: { _id: taskGroupId },
        });
        if (!taskGroupExists) {
            return res.status(404).json({
                status: false,
                message: "Task group id not found",
            });
        }
        const groupId = taskGroupExists.groupId;
        const groupExists = yield group_service_1.default.findOne({
            filter: { _id: groupId },
        });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        (0, sendMail_helper_1.default)({
            email: userExists.email,
            subject: `Your score for task group submission in ${groupExists.title} group`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <img src="${groupExists.coverPhoto}" alt="Group Cover" style="width: 100%; height: auto;">
                <div style="padding: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 90px; vertical-align: middle;">
                        <img
                          src="${groupExists.avatar}"
                          alt="Group Avatar"
                          style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                        />
                      </td>
                      <td style="vertical-align: middle;">
                        <h2 style="margin: 0; color: #007BFF;">${groupExists.title}</h2>
                      </td>
                    </tr>
                  </table>
    
                  <p style="margin-top: 15px;">
                    Your task group submission has been scored.
                  </p>

                  <div style="text-align: center; margin-top: 25px;">
                    <a href="http://localhost:5173/group-profile/scoring/${taskGroupSubmissionExists.slug}"
                      style="background-color: #28a745; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                      See my score
                    </a>
                  </div>

                </div>
                <div style="background-color: #f1f3f5; text-align: center; padding: 10px; font-size: 13px; color: #777;">
                  © 2025 NodeJS Community. All rights reserved.
                </div>
              </div>
            </div>
            `,
        });
        return res.status(200).json({
            status: true,
            message: "Task group submission updated successfully",
            data: taskGroupSubmissionExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
const taskGroupSubmissionController = {
    find,
    findBySlug,
    findByUserIdAndTaskGroupIds,
    submit,
    scoring,
};
exports.default = taskGroupSubmissionController;
