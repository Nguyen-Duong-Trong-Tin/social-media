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
const group_service_1 = __importDefault(require("../../services/client/group.service"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const message_service_1 = __importDefault(require("../../services/client/message.service"));
const roomChat_service_1 = __importDefault(require("../../services/client/roomChat.service"));
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
        const { userId, roomChatId, content, images } = data;
        if (!(content === null || content === void 0 ? void 0 : content.trim()) && (!images || images.length === 0)) {
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
                    userId,
                    roomChatId,
                },
            ],
        });
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_MESSAGE_TO_ROOM_CHAT, {
            userId,
            roomChatId,
            content: content || "",
            images: images || [],
            createdAt: newMessage === null || newMessage === void 0 ? void 0 : newMessage.createdAt,
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
    typingToRoomChat(socket, io);
};
const messageSocket = {
    sendMessageToAiAssistant,
    sendMessageToRoomChat,
    typingToRoomChat,
    register,
};
exports.default = messageSocket;
