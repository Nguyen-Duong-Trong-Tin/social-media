"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const groupTopic_controller_1 = __importDefault(require("../../controllers/client/groupTopic.controller"));
router.get("/", deserialize_middleware_1.default, groupTopic_controller_1.default.find);
router.get("/:id", deserialize_middleware_1.default, groupTopic_controller_1.default.findById);
router.get("/slug/:slug", deserialize_middleware_1.default, groupTopic_controller_1.default.findBySlug);
exports.default = router;
