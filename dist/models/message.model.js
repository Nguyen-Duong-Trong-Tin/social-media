"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        default: "",
    },
    images: {
        type: [String],
        default: [],
    },
    videos: {
        type: [String],
        default: [],
    },
    materials: {
        type: [String],
        default: []
    },
    userId: {
        type: String,
        default: "",
    },
    roomChatId: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});
const MessageModel = mongoose_1.default.model("MessageModel", MessageSchema, "messages");
exports.default = MessageModel;
