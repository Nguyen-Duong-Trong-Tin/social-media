"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const GroupTopicSchema = new mongoose_1.default.Schema({
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
    deleted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
const GroupTopicModel = mongoose_1.default.model("GroupTopicModel", GroupTopicSchema, "groupTopics");
exports.default = GroupTopicModel;
