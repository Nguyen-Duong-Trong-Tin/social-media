"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const message_controller_1 = __importDefault(require("../../controllers/client/message.controller"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
router.get("/", deserialize_middleware_1.default, message_controller_1.default.find);
router.post("/upload-images", deserialize_middleware_1.default, upload.array("images", 6), message_controller_1.default.uploadImages);
router.post("/upload-videos", deserialize_middleware_1.default, upload.array("videos", 6), message_controller_1.default.uploadVideos);
router.post("/upload-materials", deserialize_middleware_1.default, upload.array("materials", 6), message_controller_1.default.uploadMaterials);
exports.default = router;
