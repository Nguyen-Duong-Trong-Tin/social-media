"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const roomChat_controller_1 = __importDefault(require("../../controllers/client/roomChat.controller"));
router.get("/ai-assistant/:userId", deserialize_middleware_1.default, roomChat_controller_1.default.findByAiAssistantAndUserId);
exports.default = router;
