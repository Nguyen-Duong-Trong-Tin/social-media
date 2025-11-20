"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskGroup_enum_1 = require("../enums/taskGroup.enum");
const TaskGroupSchema = new mongoose_1.default.Schema({
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
    status: {
        type: String,
        enum: Object.values(taskGroup_enum_1.ETaskGroupStatus),
        required: true,
    },
    groupId: {
        type: String,
        required: true,
    },
    createdBy: {
        type: {
            userId: String,
            createdAt: Date,
        },
        required: true,
    },
    deadline: {
        type: Date,
        // +1 day from now
        default: () => Date.now() + 24 * 60 * 60 * 1000,
    },
    deleted: {
        type: Boolean,
        required: true,
    },
}, {
    timestamps: true,
});
const TaskGroupModel = mongoose_1.default.model("TaskGroupModel", TaskGroupSchema, "taskGroups");
exports.default = TaskGroupModel;
