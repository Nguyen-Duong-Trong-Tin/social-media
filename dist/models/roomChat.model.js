"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roomChat_enum_1 = require("../enums/roomChat.enum");
const RoomChatSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(roomChat_enum_1.ERoomChatType),
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(roomChat_enum_1.ERoomChatStatus),
        required: true
    },
    users: {
        type: [{
                userId: String,
                role: {
                    type: String,
                    enum: Object.values(roomChat_enum_1.ERoomChatRole),
                    required: true
                }
            }],
        required: true
    },
    userRequests: {
        type: Array,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});
const RoomChatModel = mongoose_1.default.model("RoomChatModel", RoomChatSchema, "roomChats");
exports.default = RoomChatModel;
