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
const pagination_helper_1 = __importDefault(require("../../helpers/pagination.helper"));
const filter_helper_1 = __importDefault(require("../../helpers/filter.helper"));
const sort_helper_1 = __importDefault(require("../../helpers/sort.helper"));
const roomChat_model_1 = __importDefault(require("../../models/roomChat.model"));
const slug_util_1 = __importDefault(require("../../utils/slug.util"));
const find = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = (0, pagination_helper_1.default)(req);
    const find = { deleted: false };
    if (req.query.keyword) {
        const slug = slug_util_1.default.convert(req.query.keyword);
        find.slug = new RegExp(slug, "i");
    }
    const filter = (0, filter_helper_1.default)(req);
    const sort = (0, sort_helper_1.default)(req);
    const roomChats = yield roomChat_model_1.default
        .find(Object.assign(Object.assign({}, find), filter))
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit);
    return roomChats;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const roomChatExists = yield roomChat_model_1.default.findOne({
        _id: id,
        deleted: false
    });
    return roomChatExists;
});
const findBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const roomChatExists = yield roomChat_model_1.default.findOne({
        slug,
        deleted: false
    });
    return roomChatExists;
});
const findUserInRoomChat = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomChatUserExists = yield roomChat_model_1.default.findOne({
        _id: id,
        "users.userId": userId,
        deleted: false
    });
    return roomChatUserExists;
});
const calculateMaxPage = (limit) => __awaiter(void 0, void 0, void 0, function* () {
    const quantity = yield roomChat_model_1.default.countDocuments({ deleted: false });
    return Math.ceil(quantity / limit);
});
const create = (roomChat) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = new roomChat_model_1.default(roomChat);
    yield newRoomChat.save();
    return newRoomChat;
});
const update = (id, roomChat) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, roomChat, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const changeUserRole = (id, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        "users.userId": userId,
        deleted: false
    }, {
        $set: {
            "users.$.role": role
        }
    }, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const acceptUser = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        $push: {
            users: {
                userId,
                role: roomChat_enum_1.ERoomChatRole.user
            }
        }
    }, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const delUser = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, { $pull: { users: { userId } } }, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const delUserRequest = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, { $pull: { userRequests: userId } }, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const del = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const newRoomChat = yield roomChat_model_1.default.findOneAndUpdate({
        _id: id,
        deleted: false
    }, {
        deleted: true
    }, {
        new: true,
        runValidators: true
    });
    return newRoomChat;
});
const roomChatService = {
    find,
    findById,
    findBySlug,
    findUserInRoomChat,
    calculateMaxPage,
    create,
    update,
    changeUserRole,
    acceptUser,
    delUser,
    delUserRequest,
    del
};
exports.default = roomChatService;
