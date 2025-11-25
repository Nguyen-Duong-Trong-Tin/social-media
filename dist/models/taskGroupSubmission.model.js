"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskGroupSubmission_enum_1 = require("../enums/taskGroupSubmission.enum");
const TaskGroupSubmissionSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    images: {
        type: Array,
        required: true,
    },
    videos: {
        type: Array,
        required: true,
    },
    materials: {
        type: Array,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(taskGroupSubmission_enum_1.ETaskGroupSubmissionStatus),
        required: true,
    },
    taskGroupId: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: -1,
    },
    comment: {
        type: String,
        default: "",
    },
    scoredBy: {
        type: String,
        default: "",
    },
    scoredAt: {
        type: Date,
        default: null,
    },
    createdBy: {
        type: {
            userId: String,
            createdAt: Date,
        },
        required: true,
    },
    deleted: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
});
const TaskGroupSubmissionModel = mongoose_1.default.model("TaskGroupSubmissionModel", TaskGroupSubmissionSchema, "taskGroupSubmissions");
exports.default = TaskGroupSubmissionModel;
