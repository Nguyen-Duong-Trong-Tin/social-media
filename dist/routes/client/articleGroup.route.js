"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const deserialize_middleware_1 = __importDefault(require("../../middlewares/client/deserialize.middleware"));
const articleGroup_controller_1 = __importDefault(require("../../controllers/client/articleGroup.controller"));
const multer_util_1 = __importDefault(require("../../utils/multer.util"));
const storage_util_1 = __importDefault(require("../../utils/storage.util"));
const upload = (0, multer_util_1.default)({ storage: storage_util_1.default });
router.get("/", deserialize_middleware_1.default, articleGroup_controller_1.default.find);
router.get("/slug/:slug", deserialize_middleware_1.default, articleGroup_controller_1.default.findBySlug);
router.get("/:id", deserialize_middleware_1.default, articleGroup_controller_1.default.findById);
router.post("/", deserialize_middleware_1.default, upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), articleGroup_controller_1.default.create);
router.patch("/:id", deserialize_middleware_1.default, upload.fields([
    { name: "images", maxCount: 6 },
    { name: "videos", maxCount: 6 },
]), articleGroup_controller_1.default.update);
router.delete("/:id", deserialize_middleware_1.default, articleGroup_controller_1.default.del);
exports.default = router;
