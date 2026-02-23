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
const notification_service_1 = __importDefault(require("../../services/client/notification.service"));
const notification_enum_1 = __importDefault(require("../../enums/notification.enum"));
const parseBoolean = (value) => {
    if (value === undefined)
        return undefined;
    if (value === "true")
        return true;
    if (value === "false")
        return false;
    return undefined;
};
const notificationController = {
    find: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, type, isRead, limit } = req.query;
            if (!userId) {
                return res.status(400).json({
                    status: false,
                    message: "userId is required",
                });
            }
            const filter = { userId };
            if (type)
                filter.type = type;
            const parsedRead = parseBoolean(isRead);
            if (parsedRead !== undefined) {
                filter.isRead = parsedRead;
            }
            const items = yield notification_service_1.default.find({
                filter,
                sort: { createdAt: -1 },
                limit: limit ? Number(limit) : undefined,
            });
            return res.status(200).json({
                status: true,
                message: "Notifications found",
                data: { items },
            });
        }
        catch (_a) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
    unreadCount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({
                    status: false,
                    message: "userId is required",
                });
            }
            const [total, messages, friendRequests] = yield Promise.all([
                notification_service_1.default.countDocuments({
                    filter: { userId, isRead: false },
                }),
                notification_service_1.default.countDocuments({
                    filter: { userId, isRead: false, type: notification_enum_1.default.message },
                }),
                notification_service_1.default.countDocuments({
                    filter: {
                        userId,
                        isRead: false,
                        type: notification_enum_1.default.friend_request,
                    },
                }),
            ]);
            return res.status(200).json({
                status: true,
                message: "Unread count",
                data: {
                    total,
                    byType: {
                        message: messages,
                        friend_request: friendRequests,
                    },
                },
            });
        }
        catch (_a) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
    markRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { userId, type, roomChatId } = req.body;
            if (!userId) {
                return res.status(400).json({
                    status: false,
                    message: "userId is required",
                });
            }
            const filter = { userId, isRead: false };
            if (type) {
                filter.type = type;
            }
            if (roomChatId) {
                filter["data.roomChatId"] = roomChatId;
            }
            const result = yield notification_service_1.default.updateMany({
                filter,
                update: { $set: { isRead: true } },
            });
            return res.status(200).json({
                status: true,
                message: "Notifications marked as read",
                data: {
                    modifiedCount: (_a = result.modifiedCount) !== null && _a !== void 0 ? _a : 0,
                },
            });
        }
        catch (_b) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong",
            });
        }
    }),
};
exports.default = notificationController;
