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
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const shortUniqueKey_util_1 = __importDefault(require("../../utils/shortUniqueKey.util"));
const acceptFriendRequest = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_ACCEPT_FRIEND_REQUEST, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userRequestId } = data;
        const title = `${userRequestId}-${userId}`;
        const slug = slug_util_1.default.convert(title) + "-" + shortUniqueKey_util_1.default.generate();
        const newRoomChat = yield roomChat_service_1.default.create({
            doc: {
                title: `${userRequestId}-${userId}`,
                slug,
                avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU7ipaznyPz6nmwqsZOursrDCUDeOOYkd0IQ&s",
                type: roomChat_enum_1.ERoomChatType.friend,
                status: roomChat_enum_1.ERoomChatStatus.active,
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
        const userRequestExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userRequestId, friendAccepts: userId },
            update: {
                $pull: { friendAccepts: userId },
                $push: {
                    friends: { userId: userId, roomChatId: newRoomChat.id },
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
        if (!userRequestExists) {
            console.log({
                _id: userRequestId,
                friendAccepts: userId,
                error: "User request id not found",
            });
            yield roomChat_service_1.default.deleteOne({ filter: { _id: newRoomChat.id } });
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_ACCEPT_FRIEND_REQUEST, {
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
const sendFriendRequest = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_SEND_FRIEND_REQUEST, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userRequestId } = data;
        if (userId === userRequestId) {
            return;
        }
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userId },
            update: {
                $addToSet: { friendAccepts: userRequestId },
            },
        });
        const userRequestExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userRequestId },
            update: {
                $addToSet: { friendRequests: userId },
            },
        });
        if (!userExists || !userRequestExists) {
            if (userExists) {
                yield user_service_1.default.updateOne({
                    filter: { _id: userId },
                    update: { $pull: { friendAccepts: userRequestId } },
                });
            }
            if (userRequestExists) {
                yield user_service_1.default.updateOne({
                    filter: { _id: userRequestId },
                    update: { $pull: { friendRequests: userId } },
                });
            }
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_SEND_FRIEND_REQUEST, {
            userId,
            userRequestId,
        });
    }));
};
const deleteFriendAccept = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_DELETE_FRIEND_ACCEPT, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, userRequestId } = data;
        const userExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userId, friendAccepts: userRequestId },
            update: {
                $pull: { friendAccepts: userRequestId },
            },
        });
        const userRequestExists = yield user_service_1.default.findOneAndUpdate({
            filter: { _id: userRequestId, friendRequests: userId },
            update: {
                $pull: { friendRequests: userId },
            },
        });
        if (!userExists || !userRequestExists) {
            console.log({
                userId,
                userRequestId,
            });
            return;
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_DELETE_FRIEND_ACCEPT, {
            userId,
            userRequestId,
        });
    }));
};
const deleteFriend = (socket, io) => {
    socket.on(socketEvent_enum_1.default.CLIENT_DELETE_FRIEND, (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { userId, userRequestId } = data;
        const userExists = yield user_service_1.default.findOne({
            filter: { _id: userId },
        });
        const friendEntry = (_a = userExists === null || userExists === void 0 ? void 0 : userExists.friends) === null || _a === void 0 ? void 0 : _a.find((friend) => friend.userId === userRequestId);
        if (!friendEntry) {
            return;
        }
        yield user_service_1.default.updateOne({
            filter: { _id: userId },
            update: { $pull: { friends: { userId: userRequestId } } },
        });
        yield user_service_1.default.updateOne({
            filter: { _id: userRequestId },
            update: { $pull: { friends: { userId: userId } } },
        });
        if (friendEntry.roomChatId) {
            yield roomChat_service_1.default.deleteOne({
                filter: { _id: friendEntry.roomChatId },
            });
        }
        io.emit(socketEvent_enum_1.default.SERVER_RESPONSE_DELETE_FRIEND, {
            userId,
            userRequestId,
        });
    }));
};
const register = (socket, io) => {
    acceptFriendRequest(socket, io);
    sendFriendRequest(socket, io);
    rejectFriendRequest(socket, io);
    deleteFriendAccept(socket, io);
    deleteFriend(socket, io);
};
const userSocket = {
    acceptFriendRequest,
    sendFriendRequest,
    deleteFriendAccept,
    deleteFriend,
    rejectFriendRequest,
    register,
};
exports.default = userSocket;
