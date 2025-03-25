"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const articleGroup_enum_1 = require("../enums/articleGroup.enum");
const ArticleGroupSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    videos: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(articleGroup_enum_1.EArticleGroupStatus),
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    createdBy: {
        type: {
            userId: String,
            createdAt: Date
        },
        required: true
    },
    deleted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
const ArticleGroupModel = mongoose_1.default.model("ArticleGroupModel", ArticleGroupSchema, "articleGroups");
exports.default = ArticleGroupModel;
