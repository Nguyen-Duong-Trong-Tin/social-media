"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../enums/user.enum");
const UserSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: Object.values(user_enum_1.EUserStatus),
        required: true,
    },
    coverPhoto: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    friends: {
        type: [
            {
                userId: String,
                roomChatId: String,
            },
        ],
        required: true,
    },
    friendAccepts: {
        type: Array,
        required: true,
    },
    friendRequests: {
        type: Array,
        required: true,
    },
    online: {
        type: String,
        enum: Object.values(user_enum_1.EUserOnline),
        required: true,
    },
    deleted: {
        type: Boolean,
        required: true,
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true,
});
const UserModel = mongoose_1.default.model("UserModel", UserSchema, "users");
exports.default = UserModel;
