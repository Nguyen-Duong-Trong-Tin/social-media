"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "",
    },
    message: {
        type: String,
        default: "",
    },
    data: {
        type: Object,
        default: {},
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const NotificationModel = mongoose_1.default.model("NotificationModel", NotificationSchema, "notifications");
exports.default = NotificationModel;
