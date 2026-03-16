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
const roomChat_enum_1 = require("../../enums/roomChat.enum");
const roomChat_service_1 = __importDefault(require("../../services/client/roomChat.service"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const group_enum_1 = require("../../enums/group.enum");
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const mapGroupRoleToRoomChatRole = (role) => {
    if (role === group_enum_1.EGroupRole.superAdmin)
        return roomChat_enum_1.ERoomChatRole.superAdmin;
    if (role === group_enum_1.EGroupRole.admin)
        return roomChat_enum_1.ERoomChatRole.admin;
    return roomChat_enum_1.ERoomChatRole.user;
};
const buildRoomChatUsers = (users) => {
    return users
        .filter((user) => typeof user.userId === "string" && user.userId.trim())
        .map((user) => ({
        userId: user.userId,
        role: mapGroupRoleToRoomChatRole(user.role),
    }));
};
const sortRoomChatUsers = (users) => {
    return [...users].sort((a, b) => a.userId.localeCompare(b.userId));
};
// GET /v1/roomChats/ai-assistant/:groupId/:userId
const findByAiAssistantAndUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId, userId } = req.params;
        const roomChatExists = yield roomChat_service_1.default.findOne({
            filter: {
                users: {
                    $all: [
                        { $elemMatch: { userId: userId } },
                        { $elemMatch: { userId: groupId } },
                    ],
                },
                type: roomChat_enum_1.ERoomChatType.friend,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Room chat found",
            data: roomChatExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/roomChats/group/:groupId/:userId
const findByGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId, userId } = req.params;
        const groupExists = yield group_service_1.default.findOne({
            filter: { _id: groupId },
        });
        if (!groupExists) {
            return res.status(404).json({
                status: false,
                message: "Group id not found",
            });
        }
        const isMember = (groupExists.users || []).some((user) => user.userId === userId);
        if (!isMember) {
            return res.status(403).json({
                status: false,
                message: "You are not a member of this group",
            });
        }
        const nextUsers = buildRoomChatUsers(groupExists.users || []);
        let roomChatExists = yield roomChat_service_1.default.findOne({
            filter: {
                groupId,
                type: roomChat_enum_1.ERoomChatType.group,
            },
        });
        if (!roomChatExists) {
            const title = `${groupExists.title} room`;
            const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
            roomChatExists = yield roomChat_service_1.default.create({
                doc: {
                    title,
                    slug,
                    type: roomChat_enum_1.ERoomChatType.group,
                    avatar: groupExists.avatar,
                    groupId,
                    status: roomChat_enum_1.ERoomChatStatus.active,
                    users: nextUsers,
                    userRequests: [],
                },
            });
        }
        else {
            const currentUsers = sortRoomChatUsers((roomChatExists.users || []));
            const normalizedNextUsers = sortRoomChatUsers(nextUsers);
            if (JSON.stringify(currentUsers) !== JSON.stringify(normalizedNextUsers)) {
                roomChatExists = yield roomChat_service_1.default.findOneAndUpdate({
                    filter: { _id: roomChatExists._id },
                    update: { users: normalizedNextUsers, avatar: groupExists.avatar },
                });
            }
        }
        return res.status(200).json({
            status: true,
            message: "Room chat found",
            data: roomChatExists,
        });
    }
    catch (_a) {
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
        });
    }
});
// GET /v1/roomChats/user/:userId
const findByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const roomChats = yield roomChat_service_1.default.find({
            filter: {
                users: { $elemMatch: { userId } },
                status: roomChat_enum_1.ERoomChatStatus.active,
            },
            sort: { updatedAt: -1 },
            limit: 100,
        });
        return res.status(200).json({
            status: true,
            message: "Room chats found",
            data: {
                roomChats,
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
const roomChatController = {
    findByAiAssistantAndUserId,
    findByGroupId,
    findByUserId,
};
exports.default = roomChatController;
