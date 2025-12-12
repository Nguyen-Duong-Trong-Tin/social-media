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
const socketEvent_enum_1 = __importDefault(require("../../enums/socketEvent.enum"));
const user_service_1 = __importDefault(require("../../services/client/user.service"));
const roomChat_service_1 = __importDefault(require("../../services/client/roomChat.service"));
const acceptFriendRequest = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_ACCEPT_FRIEND_REQUEST, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userRequestId } = data;
        const newRoomChat = yield roomChat_service_1.default.create({
            doc: {
                type: roomChat_enum_1.ERoomChatType.friend,
                avatar: roomChat_enum_1.ERoomChatStatus.active,
                users: [
                    { userId, role: roomChat_enum_1.ERoomChatRole.user },
                    { userId: userRequestId, role: roomChat_enum_1.ERoomChatRole.user },
                ],
            },
        });
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userId, friendRequests: userRequestId },
            update: {
                $pull: { friendRequests: userRequestId },
                $push: {
                    friends: { userId: userRequestId, roomChatId: newRoomChat.id },
                },
            },
        });
        if (!userExists) {
            console.log({
                _id: userId,
                friendRequests: userRequestId,
                error: "User id not found",
            });
            yield roomChat_service_1.default.deleteOne({ filter: { _id: newRoomChat.id } });
            return;
        }
        socket.emit(socketEvent_enum_1.default.SERVER_RESPONSE_ACCEPT_FRIEND_REQUEST, {
            userId,
            userRequestId,
            roomChatId: newRoomChat.id,
        });
    }));
};
const rejectFriendRequest = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_REJECT_FRIEND_REQUEST, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userRequestId } = data;
        const userRejectExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userId, friendRequests: userRequestId },
            update: {
                $pull: { friendRequests: userRequestId },
            },
        });
        const userRequestExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userRequestId, friendAccepts: userId },
            update: {
                $pull: { friendAccepts: userId },
            },
        });
        if (!userRejectExists || !userRequestExists) {
            console.log({
                userId,
                userRequestId,
            });
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_REJECT_FRIEND_REQUEST, {
            userId,
            userRequestId,
        });
    }));
};
const register = (socket, io) => {
    acceptFriendRequest(socket, io);
    rejectFriendRequest(socket, io);
};
const userSocket = {
    acceptFriendRequest,
    rejectFriendRequest,
    register,
};
exports.default = userSocket;
