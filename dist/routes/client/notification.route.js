"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const notification_controller_1 = __importDefault(require("../../controllers/client/notification.controller"));
router.get("/", deserialize_middleware_1.default, notification_controller_1.default.find);
router.get("/unread-count", deserialize_middleware_1.default, notification_controller_1.default.unreadCount);
router.patch("/mark-read", deserialize_middleware_1.default, notification_controller_1.default.markRead);
exports.default = router;
