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
const roomChatController = {
    findByAiAssistantAndUserId,
};
exports.default = roomChatController;
