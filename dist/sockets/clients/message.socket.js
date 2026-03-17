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
const genai_1 = require("@google/genai");
const roomChat_enum_1 = require("../../enums/roomChat.enum");
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const socketEvent_enum_1 = __importDefault(require("../../enums/socketEvent.enum"));
const notification_enum_1 = __importDefault(require("../../enums/notification.enum"));
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const message_service_1 = __importDefault(require("../../services/client/message.service"));
const roomChat_service_1 = __importDefault(require("../../services/client/roomChat.service"));
const notification_service_1 = __importDefault(require("../../services/client/notification.service"));
const toIsoString = (value) => {
    if (!value)
        return null;
    if (value instanceof Date)
        return value.toISOString();
    return value;
};
const sendMessageToAiAssistant = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_SEND_MESSAGE_TO_AI_ASSISTANT, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, message, groupId } = data;
        let [groupExists, roomChatExists] = yield Promise.all([
            group_service_1.default.findOne({
                filter: { _id: groupId },
            }),
            roomChat_service_1.default.findOne({
                filter: {
                    users: {
                        $all: [
                            { $elemMatch: { userId: userId } },
                            { $elemMatch: { userId: groupId } },
                        ],
                    },
                    type: roomChat_enum_1.ERoomChatType.friend,
                },
            }),
        ]);
        if (!groupExists) {
            console.log({
                userId,
                groupId,
                error: "Group id not found",
            });
            return;
        }
        const historyContents = [];
        if (!roomChatExists) {
            const title = `${userId}-${groupId}`;
            const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
            roomChatExists = yield roomChat_service_1.default.create({
                doc: {
                    title,
                    slug,
                    type: roomChat_enum_1.ERoomChatType.friend,
                    avatar: "https://img.cand.com.vn/resize/800x800/NewFiles/Images/2022/05/09/1_call-1652057570914.png",
                    status: roomChat_enum_1.ERoomChatStatus.active,
                    users: [
                        {
                            userId,
                            role: roomChat_enum_1.ERoomChatRole.user,
                        },
                        {
                            userId: groupId,
                            role: roomChat_enum_1.ERoomChatRole.user,
                        },
                    ],
                    userRequests: [],
                },
            });
        }
        else {
            const messages = (yield message_service_1.default.find({
                filter: { roomChatId: roomChatExists.id },
                sort: { createdAt: "desc" },
                limit: 4,
            })).reverse();
            for (const message of messages) {
                const role = message.userId === userId ? "user" : "model";
                historyContents.push({
                    role: role,
                    parts: [{ text: message.content }],
                });
            }
        }
        historyContents.push({
            role: "user",
            parts: [{ text: message }],
        });
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const geminiModel = process.env.GEMINI_MODEL;
        const ai = new genai_1.GoogleGenAI({ apiKey: geminiApiKey });
        const response = yield ai.models.generateContent({
            model: geminiModel,
            contents: historyContents,
            config: {
                systemInstruction: {
                    role: "system",
                    parts: [
                        {
                            text: `This is a group about ${groupExists.title}`,
                        },
                    ],
                },
            },
        });
        yield message_service_1.default.insertMany({
            docs: [
                {
                    content: message,
                    userId,
                    roomChatId: roomChatExists.id,
                },
                {
                    content: response.text,
                    userId: groupId,
                    roomChatId: roomChatExists.id,
                },
            ],
        });
        socket.emit(socketEvent_enum_1.default.SERVER_RESPONSE_MESSAGE_TO_AI_ASSISTANT, {
            userId,
            groupId,
            message: response.text,
        });
    }));
};
const sendMessageToRoomChat = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_SEND_MESSAGE_TO_ROOM_CHAT, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, roomChatId, content, images, videos, materials } = data;
        if (!(content === null || content === void 0 ? void 0 : content.trim()) &&
            (!images || images.length === 0) &&
            (!videos || videos.length === 0) &&
            (!materials || materials.length === 0)) {
            return;
        }
        const roomChatExists = yield roomChat_service_1.default.findOne({
            filter: {
                _id: roomChatId,
                users: { $elemMatch: { userId } },
                status: roomChat_enum_1.ERoomChatStatus.active,
            },
        });
        if (!roomChatExists) {
            console.log({
                userId,
                roomChatId,
                error: "Room chat not found or user not in room",
            });
            return;
        }
        const [newMessage] = yield message_service_1.default.insertMany({
            docs: [
                {
                    content: content || "",
                    images: images || [],
                    videos: videos || [],
                    materials: materials || [],
                    userId,
                    roomChatId,
                },
            ],
        });
        const recipients = ((roomChatExists === null || roomChatExists === void 0 ? void 0 : roomChatExists.users) || [])
            .map((user) => user.userId)
            .filter((recipientId) => recipientId && recipientId !== userId);
        if (recipients.length > 0) {
            const messageText = (content === null || content === void 0 ? void 0 : content.trim()) ||
                ((images === null || images === void 0 ? void 0 : images.length) || (videos === null || videos === void 0 ? void 0 : videos.length) || (materials === null || materials === void 0 ? void 0 : materials.length)
                    ? "Sent an attachment"
                    : "Sent a message");
            yield notification_service_1.default.insertMany({
                docs: recipients.map((recipientId) => ({
                    userId: recipientId,
                    type: notification_enum_1.default.message,
                    title: "New message",
                    message: messageText,
                    data: {
                        roomChatId,
                        fromUserId: userId,
                    },
                    isRead: false,
                    deleted: false,
                })),
            });
            recipients.forEach((recipientId) => {
                io.emit(socketEvent_enum_1.default.SERVER_PUSH_NOTIFICATION, {
                    userId: recipientId,
                    type: notification_enum_1.default.message,
                    data: { roomChatId, fromUserId: userId },
                });
            });
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_MESSAGE_TO_ROOM_CHAT, {
            _id: newMessage === null || newMessage === void 0 ? void 0 : newMessage._id,
            userId,
            roomChatId,
            content: content || "",
            images: images || [],
            videos: videos || [],
            materials: materials || [],
            pinned: (newMessage === null || newMessage === void 0 ? void 0 : newMessage.pinned) || false,
            pinnedBy: (newMessage === null || newMessage === void 0 ? void 0 : newMessage.pinnedBy) || "",
            pinnedAt: toIsoString((newMessage === null || newMessage === void 0 ? void 0 : newMessage.pinnedAt) || null),
            createdAt: newMessage === null || newMessage === void 0 ? void 0 : newMessage.createdAt,
            deleted: (newMessage === null || newMessage === void 0 ? void 0 : newMessage.deleted) || false,
        });
    }));
};
const togglePinMessage = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_TOGGLE_PIN_MESSAGE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, roomChatId, messageId, pinned } = data;
        if (!userId || !roomChatId || !messageId) {
            return;
        }
        const roomChatExists = yield roomChat_service_1.default.findOne({
            filter: {
                _id: roomChatId,
                users: { $elemMatch: { userId } },
                status: roomChat_enum_1.ERoomChatStatus.active,
            },
        });
        if (!roomChatExists) {
            return;
        }
        const messageExists = yield message_service_1.default.findOne({
            filter: { _id: messageId, roomChatId },
        });
        if (!messageExists) {
            return;
        }
        const update = pinned
            ? {
                pinned: true,
                pinnedBy: userId,
                pinnedAt: new Date(),
            }
            : {
                pinned: false,
                pinnedBy: "",
                pinnedAt: null,
            };
        const updatedMessage = yield message_service_1.default.findOneAndUpdate({
            filter: { _id: messageId, roomChatId },
            update,
        });
        if (!updatedMessage) {
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_PIN_MESSAGE, {
            userId,
            roomChatId,
            messageId,
            pinned: updatedMessage.pinned || false,
            pinnedBy: updatedMessage.pinnedBy || "",
            pinnedAt: toIsoString(updatedMessage.pinnedAt || null),
        });
    }));
};
const deleteMessage = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_DELETE_MESSAGE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, roomChatId, messageId } = data;
        if (!userId || !roomChatId || !messageId) {
            return;
        }
        const roomChatExists = yield roomChat_service_1.default.findOne({
            filter: {
                _id: roomChatId,
                users: { $elemMatch: { userId } },
                status: roomChat_enum_1.ERoomChatStatus.active,
            },
        });
        if (!roomChatExists) {
            return;
        }
        const messageExists = yield message_service_1.default.findOne({
            filter: { _id: messageId, roomChatId, userId },
        });
        if (!messageExists || messageExists.deleted) {
            return;
        }
        const updatedMessage = yield message_service_1.default.findOneAndUpdate({
            filter: { _id: messageId, roomChatId, userId },
            update: {
                deleted: true,
                pinned: false,
                pinnedBy: "",
                pinnedAt: null,
            },
        });
        if (!updatedMessage) {
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_DELETE_MESSAGE, {
            userId,
            roomChatId,
            messageId,
            deleted: true,
        });
    }));
};
const typingToRoomChat = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_TYPING_TO_ROOM_CHAT, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, roomChatId, isTyping } = data;
        if (!roomChatId || !userId) {
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_TYPING_TO_ROOM_CHAT, {
            userId,
            roomChatId,
            isTyping,
        });
    }));
};
const register = (socket, io) => {
    sendMessageToAiAssistant(socket, io);
    sendMessageToRoomChat(socket, io);
    togglePinMessage(socket, io);
    deleteMessage(socket, io);
    typingToRoomChat(socket, io);
};
const messageSocket = {
    sendMessageToAiAssistant,
    sendMessageToRoomChat,
    deleteMessage,
    typingToRoomChat,
    register,
};
exports.default = messageSocket;
