"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const group_enum_1 = require("../enums/group.enum");
const GroupSchema = new mongoose_1.default.Schema({
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
    avatar: {
        type: String,
        required: true
    },
    coverPhoto: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(group_enum_1.EGroupStatus),
        required: true
    },
    users: {
        type: [{
                userId: String,
                role: {
                    type: String,
                    enum: Object.values(group_enum_1.EGroupRole),
                    required: true
                }
            }],
        required: true
    },
    userRequests: {
        type: Array,
        required: true
    },
    groupTopicId: {
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
const GroupModel = mongoose_1.default.model("GroupModel", GroupSchema, "groups");
exports.default = GroupModel;
