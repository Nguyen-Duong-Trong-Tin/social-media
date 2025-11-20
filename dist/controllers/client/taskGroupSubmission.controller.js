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
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const taskGroup_service_1 = __importDefault(require("../../services/client/taskGroup.service"));
const taskGroupSubmission_service_1 = __importDefault(require("../../services/client/taskGroupSubmission.service"));
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
                },
            },
        });
        if (!taskGroupSubmissionExists) {
            if (taskGroupSubmissionSlugExists) {
                return res.status(500).json({
                    status: false,
                    message: "Something went wrong. Please try again",
                });
            }
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
const taskGroupSubmissionController = {
    findByUserIdAndTaskGroupIds,
    submit,
};
exports.default = taskGroupSubmissionController;
